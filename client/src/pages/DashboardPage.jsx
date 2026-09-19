import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ClipboardList, FolderKanban, Image as ImageIcon, LogOut, Package, Save, Settings, ShieldCheck, ShoppingBag, Tags } from 'lucide-react';
import { getContent, request } from '../lib/api';

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
  ['site', Settings],
  ['products', Package],
  ['categories', Tags],
  ['brands', ShieldCheck],
  ['industries', Package],
  ['projects', FolderKanban],
  ['gallery', ImageIcon],
  ['enquiries', ClipboardList],
  ['orders', ShoppingBag],
];

export default function DashboardPage() {
  const [token, setToken] = useState(localStorage.getItem('raja_admin_token'));
  const [content, setContent] = useState(null);
  const [view, setView] = useState('site');
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

  useEffect(() => {
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
            {key === 'site' ? 'Website content' : labels[key]}
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
          {!isRecords && view !== 'site' && (
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
                      <img src={item.image || item.logo} alt="" />
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
