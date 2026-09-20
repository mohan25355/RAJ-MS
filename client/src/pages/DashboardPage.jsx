import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ClipboardList, Image as ImageIcon, LogOut, Package, Save, ShieldCheck, ShoppingBag, Tags } from 'lucide-react';
import { getContent, request, resolveApiUrl } from '../lib/api';

const fields = {
  products: ['name', 'category', 'price', 'badge', 'description', 'features', 'specifications', 'colors'],
  categories: ['name', 'description', 'icon', 'color', 'display_order', 'is_active'],
  brands: ['name', 'category', 'description', 'websiteUrl', 'display_order', 'is_active'],
  industries: ['name', 'description'],
  gallery: ['title', 'category', 'description', 'display_order', 'is_active'],
  projects: ['name', 'category', 'location', 'year', 'products', 'description'],
};

const labels = {
  products: 'Products',
  categories: 'Categories',
  brands: 'Brands',
  industries: 'Industries',
  gallery: 'Gallery',
  projects: 'Projects',
  enquiries: 'Customer enquiries',
  orders: 'Customer orders',
};

const blank = collection => {
  const initial = Object.fromEntries((fields[collection] || []).map(key => [key, '']));
  if (collection === 'categories' || collection === 'brands' || collection === 'gallery') {
    initial.display_order = 1;
    initial.is_active = true;
  }
  if (collection === 'gallery') {
    initial.category = 'Store';
  }
  return initial;
};

const nav = [
  ['products', Package],
  ['categories', Tags],
  ['brands', ShieldCheck],
  ['gallery', ImageIcon],
  ['enquiries', ClipboardList],
  ['orders', ShoppingBag],
];

export default function DashboardPage() {
  const [token, setToken] = useState(localStorage.getItem('raja_admin_token'));
  const [content, setContent] = useState(null);
  const [view, setView] = useState('products');
  const [editing, setEditing] = useState(null);
  const [records, setRecords] = useState([]);
  const [notice, setNotice] = useState('');
  const [pendingCatalogue, setPendingCatalogue] = useState(null);

  const isRecords = view === 'orders' || view === 'enquiries';

  const reload = async () => {
    try {
      if (isRecords) setRecords(await request(`/admin/${view}`));
      else setContent(await getContent(true));
    } catch (error) {
      setNotice(error.message);
    }
  };

  const validViewKeys = nav.map(([k]) => k);
  useEffect(() => {
    if (!validViewKeys.includes(view)) {
      setView('products');
      return;
    }
    if (token) reload();
  }, [token, view]);

  const login = async event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await request('/auth/login', 'POST', values);
      localStorage.setItem('raja_admin_token', result.token);
      setToken(result.token);
      setNotice('');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const logout = async () => {
    try {
      await request('/auth/logout', 'POST');
    } finally {
      localStorage.removeItem('raja_admin_token');
      setToken(null);
    }
  };

  const save = async event => {
    event.preventDefault();
    const value = Object.fromEntries(new FormData(event.currentTarget));

    ['image', 'logo', 'heroImage', 'heroImage2', 'heroImage3', 'aboutImage'].forEach(field => {
      if (editing?.[field]) value[field] = editing[field];
    });

    if (value.is_active !== undefined) {
      value.is_active = value.is_active === 'true' || value.is_active === true;
    }
    if (value.display_order !== undefined) {
      value.display_order = parseInt(value.display_order, 10) || 1;
    }

    try {
      if (view === 'site') {
        await request('/site', 'PUT', value);
      } else {
        let saved = await request(
          `/${view}${editing?.id ? `/${editing.id}` : ''}`,
          editing?.id ? 'PUT' : 'POST',
          value
        );

        if (view === 'products' && pendingCatalogue) {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(pendingCatalogue.file);
          });
          saved = await request(`/products/${saved.id}/catalogue`, 'PUT', {
            fileName: pendingCatalogue.name,
            data: dataUrl,
          });
        }
      }

      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      setNotice('Saved successfully.');
      setPendingCatalogue(null);
      setEditing(null);
      reload();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const remove = async item => {
    let message = 'Delete this item?';
    if (view === 'brands') {
      message = `Delete brand "${item.name || 'this item'}"? It will be removed from the public Brands page.`;
    } else if (view === 'gallery') {
      message = `Delete gallery image "${item.title || 'this item'}"? Are you sure?`;
    } else if (view === 'categories') {
      const childCount = (content?.brands || []).filter(b => b.category === item.name).length;
      message = `Delete category "${item.name}"?${childCount ? ` It currently contains ${childCount} brand(s).` : ''} Are you sure?`;
    }

    if (!window.confirm(message)) return;

    try {
      await request(`/${view}/${item.id}`, 'DELETE');
      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      reload();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const moveOrder = async (item, direction) => {
    const list = [...(content?.[view] || [])].sort(
      (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999)
    );
    const index = list.findIndex(i => i.id === item.id);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const currentItem = list[index];
    const targetItem = list[targetIndex];

    const currentOrder = Number(currentItem.display_order) || index + 1;
    const targetOrder = Number(targetItem.display_order) || targetIndex + 1;

    const newCurrentOrder = currentOrder === targetOrder ? (direction === 'up' ? targetOrder - 1 : targetOrder + 1) : targetOrder;
    const newTargetOrder = currentOrder;

    try {
      await Promise.all([
        request(`/${view}/${currentItem.id}`, 'PUT', { ...currentItem, display_order: newCurrentOrder }),
        request(`/${view}/${targetItem.id}`, 'PUT', { ...targetItem, display_order: newTargetOrder }),
      ]);
      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      reload();
    } catch (error) {
      setNotice('Failed to update order: ' + error.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await request(`/admin/${view}/${id}`, 'PATCH', { status });
      setRecords(items => items.map(item => (item.id === id ? { ...item, status } : item)));
    } catch (error) {
      setNotice(error.message);
    }
  };

  const upload = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditing(item => ({
        ...(item || (view === 'site' ? content?.site : blank(view))),
        [field || (view === 'brands' ? 'logo' : view === 'site' ? 'heroImage' : 'image')]: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const uploadCatalogue = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingCatalogue({ name: file.name, file });
    setEditing(item => ({ ...(item || blank(view)), catalogName: file.name }));
  };

  const removeCatalogue = async () => {
    if (!editing?.id) return;
    try {
      await request(`/products/${editing.id}/catalogue`, 'DELETE');
      setPendingCatalogue(null);
      setEditing(item => ({ ...item, catalogName: undefined, catalogUrl: undefined }));
      setNotice('Catalogue removed.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  if (!token)
    return (
      <main className="login-page">
        <form onSubmit={login}>
          <ShieldCheck size={36} />
          <h1>Admin sign in</h1>
          <p>Manage products, customer enquiries and orders.</p>
          <input name="email" type="email" placeholder="Email" defaultValue="" required />
          <input name="password" type="password" placeholder="Password" required />
          <button>Sign in</button>
          <a className="login-home" href="#home">
            ← Back to home
          </a>
          {notice && <em>{notice}</em>}
        </form>
      </main>
    );

  const rawList = content?.[view] || [];
  const list = [...rawList].sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));
  const current = editing || (view === 'site' ? content?.site : null);

  return (
    <div className="cms-admin">
      <aside>
        <b>RAJA CMS</b>
        {nav.map(([key, Icon]) => (
          <button
            className={view === key ? 'active' : ''}
            onClick={() => {
              setView(key);
              setEditing(null);
              setNotice('');
              setPendingCatalogue(null);
            }}
            key={key}
          >
            <Icon size={16} />
            {labels[key]}
          </button>
        ))}
        <button onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <main>
        <header>
          <div>
            <small>CONTENT MANAGER</small>
            <h1>{view === 'site' ? 'Homepage content' : labels[view]}</h1>
          </div>
          {!isRecords && view !== 'site' && view !== 'brands' && (
            <button
              className="add-btn"
              onClick={() => {
                setEditing(blank(view));
                setPendingCatalogue(null);
              }}
            >
              + Add {labels[view].slice(0, -1)}
            </button>
          )}
        </header>

        {notice && <p className="cms-notice">{notice}</p>}

        {isRecords ? (
          <Records items={records} type={view} onStatus={updateStatus} />
        ) : view === 'brands' ? (
          <BrandManager content={content} reload={reload} setNotice={setNotice} />
        ) : (
          <>
            {current && (
              <Editor
                key={`${view}-${current.id || 'site'}-${(current.image || current.logo || '').length}`}
                view={view}
                item={current}
                categories={content?.categories || []}
                onSave={save}
                onUpload={upload}
                onUploadCatalogue={uploadCatalogue}
                pendingCatalogue={pendingCatalogue}
                onRemoveCatalogue={removeCatalogue}
              />
            )}

            {view !== 'site' && !editing && (
              <div className="cms-list">
                {list.map((item, idx) => (
                  <article key={item.id || idx}>
                    {(item.image || item.logo) ? (
                      <img src={resolveApiUrl(item.image || item.logo)} alt="" />
                    ) : (
                      <div className="cms-no-img">{item.name?.slice(0, 2).toUpperCase() || 'NO'}</div>
                    )}
                    <div>
                      <b>
                        {item.name || item.title}
                        {item.is_active === false && <span className="badge-inactive">Inactive</span>}
                        {item.is_active !== false && <span className="badge-active">Active</span>}
                        {item.display_order !== undefined && <span className="badge-order">#{item.display_order}</span>}
                      </b>
                      <small>{item.category || item.type || item.description || 'No description'}</small>
                    </div>

                    {(view === 'categories' || view === 'brands' || view === 'gallery') && (
                      <div className="cms-order-btns">
                        <button
                          type="button"
                          className="btn-move"
                          title="Move Up"
                          disabled={idx === 0}
                          onClick={() => moveOrder(item, 'up')}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-move"
                          title="Move Down"
                          disabled={idx === list.length - 1}
                          onClick={() => moveOrder(item, 'down')}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}

                    <button onClick={() => setEditing(item)}>Edit</button>
                    <button className="delete" onClick={() => remove(item)}>
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Records({ items, type, onStatus }) {
  const options = type === 'orders' ? ['New', 'Confirmed', 'Processing', 'Completed', 'Cancelled'] : ['New', 'Contacted', 'Closed'];
  if (!items.length) return <p>No customer requests yet.</p>;
  return (
    <div className="cms-list">
      {items.map(item => {
        const receivedAt = item.created_at || item.createdAt || item.submittedAt;
        const isOrder = type === 'orders';
        return (
          <article className="customer-record" key={item.id}>
            <div>
              <b>
                {isOrder ? item.customerName : item.name} — {isOrder ? item.productName : item.product || 'General enquiry'}
              </b>
              <small>
                <strong>Phone:</strong> {item.phone}
                {item.email && <> · <strong>Email:</strong> {item.email}</>}
                {item.company && <> · <strong>Company:</strong> {item.company}</>}
                <br />
                {isOrder ? (
                  <>
                    <strong>Quantity:</strong> {item.quantity}
                    {item.notes && <> · <strong>Notes:</strong> {item.notes}</>}
                  </>
                ) : (
                  <>
                    <strong>Requirement:</strong> {item.quantity || 'Not specified'}
                    <br />
                    <strong>Message:</strong> {item.message || 'No additional message.'}
                    {item.source && (
                      <>
                        <br />
                        <strong>Source:</strong> {item.source}
                      </>
                    )}
                  </>
                )}
                {receivedAt && (
                  <>
                    <br />
                    <strong>Received:</strong> {new Date(receivedAt).toLocaleString()}
                  </>
                )}
              </small>
            </div>
            <select value={item.status || 'New'} onChange={event => onStatus(item.id, event.target.value)}>
              {options.map(status => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </article>
        );
      })}
    </div>
  );
}

function Editor({ view, item, categories, onSave, onUpload, onUploadCatalogue, pendingCatalogue, onRemoveCatalogue }) {
  const names =
    view === 'site'
      ? [
          'businessName',
          'welcome',
          'heroTitle',
          'heroText',
          'deliveryText',
          'trustYears',
          'productCount',
          'happyClients',
          'supplyTitle',
          'supplyText',
          'aboutKicker',
          'aboutTitle',
          'aboutIntro',
          'aboutDescription',
          'aboutValues',
          'phone',
          'email',
          'address',
          'whatsappNumber',
          'whatsappMessage',
        ]
      : fields[view] || [];

  const imageFields =
    view === 'site'
      ? [
          ['heroImage', 'Hero image 1'],
          ['heroImage2', 'Hero image 2'],
          ['heroImage3', 'Hero image 3'],
          ['aboutImage', 'About page image'],
        ]
      : [[view === 'brands' ? 'logo' : 'image', `Upload ${view === 'brands' ? 'logo' : 'Category image / background'}`]];

  return (
    <form className="cms-editor" onSubmit={onSave}>
      <h2>{view === 'site' ? 'Edit Home, About and contact content' : item.id ? 'Edit item' : 'Add item'}</h2>
      {names.map(name => (
        <label key={name}>
          {name.replace(/([A-Z])/g, ' $1')}
          {view === 'products' && name === 'category' ? (
            <select name="category" defaultValue={item.category || ''} required>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map(category => (
                <option key={category.id || category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : view === 'gallery' && name === 'category' ? (
            <select name="category" defaultValue={item.category || item.type || 'Store'} required>
              <option value="Store">Store</option>
              <option value="Products">Products</option>
              <option value="Projects">Projects</option>
              <option value="Deliveries">Deliveries</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Hardware">Hardware</option>
              <option value="Paints">Paints</option>
              <option value="Site Work">Site Work</option>
            </select>
          ) : view === 'brands' && name === 'category' ? (
            <select name="category" defaultValue={item.category || ''} required>
              <option value="" disabled>
                Select a brand category
              </option>
              {categories.map(category => (
                <option key={category.id || category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : name === 'is_active' ? (
            <select name="is_active" defaultValue={String(item.is_active !== false)}>
              <option value="true">Active (Visible on public site)</option>
              <option value="false">Inactive (Hidden from public site)</option>
            </select>
          ) : view === 'categories' && name === 'icon' ? (
            <select name="icon" defaultValue={item.icon || 'Package'}>
              <option value="PaintRoller">PaintRoller (Paints & Coatings)</option>
              <option value="Cable">Cable (Wires & Cables)</option>
              <option value="Droplets">Droplets (Pipes & Pumps)</option>
              <option value="Wrench">Wrench (Switches & Hardware)</option>
              <option value="Lightbulb">Lightbulb (Lighting)</option>
              <option value="Fan">Fan (Fans)</option>
              <option value="Thermometer">Thermometer (Water Heaters)</option>
              <option value="Bath">Bath (Sanitaryware & Bathroom)</option>
              <option value="ShieldCheck">ShieldCheck (Waterproofing)</option>
              <option value="Camera">Camera (Security & Protection)</option>
              <option value="House">House (Home Appliances)</option>
              <option value="Package">Package (General Hardware)</option>
            </select>
          ) : view === 'categories' && name === 'color' ? (
            <select name="color" defaultValue={item.color || 'blue'}>
              <option value="rose">Rose</option>
              <option value="gold">Gold</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="mint">Mint</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
            </select>
          ) : name === 'display_order' ? (
            <input name="display_order" type="number" min="1" defaultValue={item.display_order ?? 1} required />
          ) : (
            <textarea
              name={name}
              defaultValue={item[name] || ''}
              required={view === 'products' && (name === 'name' || name === 'category')}
              rows={
                name.includes('Description') ||
                name.includes('description') ||
                name.includes('Text') ||
                name.includes('Values') ||
                name === 'heroTitle' ||
                name === 'features' ||
                name === 'specifications'
                  ? 3
                  : 1
              }
            />
          )}
        </label>
      ))}

      {imageFields.map(([field, label]) => (
        <label key={field}>
          {label}
          <input type="file" accept="image/*" onChange={event => onUpload(event, field)} />
          {item[field] && <img className="cms-preview" src={item[field]} alt={`${label} preview`} />}
        </label>
      ))}

      {view === 'products' && (
        <label>
          Upload catalogue (PDF)
          <input type="file" accept="application/pdf" onChange={onUploadCatalogue} />
          {pendingCatalogue && <small style={{ color: 'var(--orange)' }}>To upload: {pendingCatalogue.name} (saved when you press Save)</small>}
          {!pendingCatalogue && item.catalogName && <small>Current file: {item.catalogName}</small>}
          {!pendingCatalogue && item.id && item.catalogUrl && (
            <button type="button" className="delete" style={{ marginTop: '8px' }} onClick={onRemoveCatalogue}>
              Remove catalogue
            </button>
          )}
        </label>
      )}

      <button>
        <Save size={16} />
        Save changes
      </button>
    </form>
  );
}

function BrandManager({ content, reload, setNotice }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingBrand, setEditingBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const targetCategories = [
    'Paints & Coatings',
    'Wires & Cables',
    'Pipes & Plumbing',
    'Switches & Electrical',
    'Fans',
    'Lighting',
    'Sanitaryware & Bathroom',
    'Water Heaters',
    'Water Pumps',
    'Waterproofing',
    'Security & Protection'
  ];

  // Group brands into canonical entities
  const canonicalMap = {};
  (content?.brands || []).forEach(item => {
    const rawName = (item.name || '').trim();
    if (!rawName) return;
    const normKey = rawName.toLowerCase();
    if (!canonicalMap[normKey]) {
      canonicalMap[normKey] = {
        name: rawName,
        logo: item.logo || null,
        is_active: item.is_active !== false,
        placements: []
      };
    }
    if (item.logo && !canonicalMap[normKey].logo) {
      canonicalMap[normKey].logo = item.logo;
    }
    const catName = item.category || item.data?.category || 'General';
    const order = item.display_order ?? item.data?.display_order ?? 99;
    canonicalMap[normKey].placements.push({
      id: item.id,
      category: catName,
      display_order: Number(order),
      is_active: item.is_active !== false,
      logo: item.logo
    });
  });

  let canonicalList = Object.values(canonicalMap);

  // Search filter
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    canonicalList = canonicalList.filter(b => b.name.toLowerCase().includes(q));
  }

  // Category filter
  if (catFilter !== 'ALL') {
    canonicalList = canonicalList.filter(b =>
      b.placements.some(p => p.category.toLowerCase() === catFilter.toLowerCase())
    );
  }

  // Status filter
  if (statusFilter !== 'ALL') {
    const wantActive = statusFilter === 'ACTIVE';
    canonicalList = canonicalList.filter(b => b.is_active === wantActive);
  }

  // Handlers
  const handleAddNew = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (brand) => {
    const newActive = !brand.is_active;
    try {
      for (const p of brand.placements) {
        await request(`/brands/${p.id}`, 'PUT', { ...p, is_active: newActive, category: p.category });
      }
      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      setNotice(`"${brand.name}" marked as ${newActive ? 'Active' : 'Inactive'}.`);
      reload();
    } catch (e) {
      setNotice(e.message);
    }
  };

  const handleReplaceLogo = (brand, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const logoDataUrl = reader.result;
      try {
        for (const p of brand.placements) {
          await request(`/brands/${p.id}`, 'PUT', { ...p, logo: logoDataUrl, category: p.category });
        }
        localStorage.setItem('raja_content_updated', String(Date.now()));
        window.dispatchEvent(new Event('raja-content-updated'));
        setNotice(`Logo replaced for ${brand.name}.`);
        reload();
      } catch (e) {
        setNotice(e.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async (brand) => {
    if (!window.confirm(`Remove logo for "${brand.name}"? The public Brands page will display a text badge.`)) return;
    try {
      for (const p of brand.placements) {
        await request(`/brands/${p.id}`, 'PUT', { ...p, logo: null, category: p.category });
      }
      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      setNotice(`Logo removed for ${brand.name}.`);
      reload();
    } catch (e) {
      setNotice(e.message);
    }
  };

  const handleRemovePlacement = async (brand, placement) => {
    if (!window.confirm(`Remove "${brand.name}" from "${placement.category}"?`)) return;
    try {
      await request(`/brands/${placement.id}`, 'DELETE');
      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      setNotice(`Removed ${brand.name} from ${placement.category}.`);
      reload();
    } catch (e) {
      setNotice(e.message);
    }
  };

  const handleDeleteBrand = async (brand) => {
    if (!window.confirm(`Delete Brand "${brand.name}"?\nThis will remove "${brand.name}" from all assigned categories.`)) return;
    try {
      for (const p of brand.placements) {
        await request(`/brands/${p.id}`, 'DELETE');
      }
      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      setNotice(`Brand "${brand.name}" deleted.`);
      reload();
    } catch (e) {
      setNotice(e.message);
    }
  };

  const handleSaveBrandForm = async (formData) => {
    try {
      const { isEdit, originalBrand, name, logo, is_active, selectedPlacements, placementsMap } = formData;

      if (isEdit) {
        // 1. Save / update selected placements
        for (const item of selectedPlacements) {
          if (item.id) {
            await request(`/brands/${item.id}`, 'PUT', {
              id: item.id,
              name,
              logo,
              category: item.category,
              display_order: item.display_order,
              is_active
            });
          } else {
            await request('/brands', 'POST', {
              name,
              logo,
              category: item.category,
              display_order: item.display_order,
              is_active
            });
          }
        }
        // 2. Remove unchecked category placements
        if (originalBrand?.placements) {
          for (const p of originalBrand.placements) {
            if (!placementsMap[p.category]?.checked) {
              await request(`/brands/${p.id}`, 'DELETE');
            }
          }
        }
      } else {
        // New brand creation
        for (const item of selectedPlacements) {
          await request('/brands', 'POST', {
            name,
            logo,
            category: item.category,
            display_order: item.display_order,
            is_active
          });
        }
      }

      localStorage.setItem('raja_content_updated', String(Date.now()));
      window.dispatchEvent(new Event('raja-content-updated'));
      setNotice(`Brand "${name}" saved successfully.`);
      setIsModalOpen(false);
      setEditingBrand(null);
      reload();
    } catch (e) {
      setNotice(e.message);
    }
  };

  return (
    <div className="brand-manager-container">
      <div className="brand-toolbar">
        <button className="add-btn" onClick={handleAddNew}>
          + Add New Brand
        </button>
        <input
          type="text"
          placeholder="Search brands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="ALL">All Categories</option>
          {targetCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="brand-grid-admin">
        {canonicalList.map(brand => (
          <div className="brand-card-admin" key={brand.name}>
            <div>
              <div className="brand-card-header">
                {brand.logo ? (
                  <img className="brand-card-logo" src={brand.logo} alt={brand.name} />
                ) : (
                  <div className="brand-card-badge-no-logo">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="brand-card-title">{brand.name}</div>
                  {brand.is_active ? (
                    <span className="badge-active">● Active</span>
                  ) : (
                    <span className="badge-inactive">● Inactive</span>
                  )}
                </div>
              </div>

              <div className="brand-card-placements">
                {brand.placements.map(p => (
                  <div className="brand-placement-chip" key={p.id}>
                    <span>{p.category}</span>
                    <strong>#{p.display_order}</strong>
                    <button
                      type="button"
                      title={`Remove from ${p.category}`}
                      onClick={() => handleRemovePlacement(brand, p)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="brand-card-actions">
              <button type="button" onClick={() => handleEdit(brand)}>
                Edit
              </button>
              <label className="btn-action-upload" title="Replace Logo">
                Replace Logo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files?.[0]) handleReplaceLogo(brand, e.target.files[0]);
                  }}
                />
              </label>
              {brand.logo && (
                <button type="button" onClick={() => handleRemoveLogo(brand)}>
                  Remove Logo
                </button>
              )}
              <button type="button" onClick={() => handleToggleStatus(brand)}>
                {brand.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button type="button" className="btn-danger" onClick={() => handleDeleteBrand(brand)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <BrandModal
          brand={editingBrand}
          targetCategories={targetCategories}
          canonicalMap={canonicalMap}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBrandForm}
        />
      )}
    </div>
  );
}

function BrandModal({ brand, targetCategories, canonicalMap, onClose, onSave }) {
  const isEdit = !!brand;
  const [name, setName] = useState(brand?.name || '');
  const [logo, setLogo] = useState(brand?.logo || null);
  const [isActive, setIsActive] = useState(brand?.is_active !== false);
  const [errorMsg, setErrorMsg] = useState('');

  const [placementsMap, setPlacementsMap] = useState(() => {
    const map = {};
    targetCategories.forEach((cat, idx) => {
      const p = brand?.placements?.find(item => item.category === cat);
      map[cat] = {
        checked: !!p,
        display_order: p ? p.display_order : idx + 1,
        id: p ? p.id : null
      };
    });
    return map;
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const handleToggleCategory = (cat) => {
    setPlacementsMap(prev => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        checked: !prev[cat]?.checked
      }
    }));
  };

  const handleOrderChange = (cat, val) => {
    setPlacementsMap(prev => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        display_order: parseInt(val, 10) || 1
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Brand name is required.');
      return;
    }

    // Duplicate prevention for new brands
    if (!isEdit && canonicalMap[trimmedName.toLowerCase()]) {
      setErrorMsg('Brand already exists. Edit the existing brand or manage its categories.');
      return;
    }

    const selectedPlacements = Object.entries(placementsMap)
      .filter(([_, v]) => v.checked)
      .map(([cat, v]) => ({
        category: cat,
        display_order: Number(v.display_order) || 1,
        id: v.id
      }));

    if (selectedPlacements.length === 0) {
      setErrorMsg('Please select at least one category for this brand.');
      return;
    }

    onSave({
      isEdit,
      originalBrand: brand,
      name: trimmedName,
      logo,
      is_active: isActive,
      selectedPlacements,
      placementsMap
    });
  };

  return (
    <div className="brand-modal-overlay">
      <div className="brand-modal">
        <h2>{isEdit ? `Edit Brand: ${brand.name}` : 'Add New Brand'}</h2>

        {errorMsg && <p className="cms-notice" style={{ background: '#fee2e2', color: '#b91c1c' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '14px', fontWeight: 'bold' }}>
            Brand Name *
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Orbit"
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '14px', fontWeight: 'bold' }}>
            Brand Logo
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'block', marginTop: '6px' }} />
            {logo ? (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img className="brand-modal-preview" src={logo} alt="Logo preview" />
                <button type="button" onClick={() => setLogo(null)} style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#b91c1c', borderRadius: '4px' }}>
                  Remove Logo
                </button>
              </div>
            ) : (
              <small style={{ display: 'block', marginTop: '6px', color: '#64748b' }}>
                No logo uploaded. Public page will display text badge.
              </small>
            )}
          </label>

          <label style={{ display: 'block', marginBottom: '14px', fontWeight: 'bold' }}>
            Status
            <select
              value={isActive ? 'true' : 'false'}
              onChange={e => setIsActive(e.target.value === 'true')}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="true">Active (Visible on public site)</option>
              <option value="false">Inactive (Hidden from public site)</option>
            </select>
          </label>

          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Categories & Category Display Order *</div>
          <div className="brand-modal-categories">
            {targetCategories.map(cat => {
              const info = placementsMap[cat] || { checked: false, display_order: 1 };
              return (
                <div className="category-option-row" key={cat}>
                  <label>
                    <input
                      type="checkbox"
                      checked={info.checked}
                      onChange={() => handleToggleCategory(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                  {info.checked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Order:</span>
                      <input
                        type="number"
                        min="1"
                        value={info.display_order}
                        onChange={e => handleOrderChange(cat, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="brand-modal-footer">
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="add-btn" style={{ cursor: 'pointer' }}>
              {isEdit ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

