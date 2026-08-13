import { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { images } from '../data/catalog';
import { request } from '../lib/api';
import { Btn, PageHead } from '../components/ui';

export default function ContactPage({ content }) {
  const [selected, setSelected] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('raja_selected_product'));
    } catch {
      return null;
    }
  });

  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setNotice('');

    const values = Object.fromEntries(new FormData(event.currentTarget));
    setSending(true);

    try {
      const result = selected
        ? await request('/orders', 'POST', {
            customerName: values.name,
            company: values.company,
            phone: values.phone,
            email: values.email,
            productId: selected.id,
            productName: selected.name,
            quantity: Number(values.quantity) || 1,
            notes: values.message
          })
        : await request('/enquiries', 'POST', values);

      setNotice(result.message);
      event.currentTarget.reset();
      localStorage.removeItem('raja_selected_product');
      setSelected(null);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSending(false);
    }
  };

  const site = content?.site || {};

  return (
    <>
      <PageHead
        crumb="Contact Us"
        title={
          selected ? (
            <>
              Order <em>{selected.name}</em>
            </>
          ) : (
            <>
              Contact <em>Us</em>
            </>
          )
        }
        desc="Tell us what you need. Our team will guide you to the right products and provide a prompt quote."
      />

      <section className="contact">
        <div className="contact-info">
          <small className="section-kicker">Talk to our team</small>

          <h2>Let's start a project</h2>

          <p>
            From a quick product enquiry to a large project requirement, our
            team is ready to help with availability, specifications and
            delivery.
          </p>

          <p>
            <MapPin />
            {site.address ||
              'NO-74 / 82, Periyar Pathai, Andavar Nagar, Choolaimedu, Chennai, Greater Chennai, Tamil Nadu 600094'}
          </p>

          <p>
            <Phone />
            {site.phone || '+91 99413 36125'}
          </p>

          <p>
            <Mail />
            {site.email || 'sales@rkinnovations.com'}
          </p>

          <p>
            <Clock />
            Mon - Sat: 08:00 AM - 7:00 PM
          </p>

          <img src={images.site} alt="Raja Electricals" />
        </div>

        <form onSubmit={submit}>
          <small className="section-kicker">
            {selected ? 'Order request' : 'Connect with us'}
          </small>

          <h2>
            {selected
              ? `Order ${selected.name}`
              : 'Tell us about your requirement'}
          </h2>

          <div className="two">
            <input
              name="name"
              placeholder="Your Name"
              required
            />

            <input
              name="company"
              placeholder="Company Name"
            />
          </div>

          <div className="two">
            <input
              name="phone"
              placeholder="Phone Number"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
            />
          </div>

          {selected ? (
            <input
              value={selected.name}
              readOnly
            />
          ) : (
            <select
              name="product"
              defaultValue=""
            >
              <option value="" disabled>
                Product / Category
              </option>

              {(content?.categories || []).map(item => (
                <option key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}

          <input
            name="quantity"
            type={selected ? 'number' : 'text'}
            min={selected ? '1' : undefined}
            placeholder={
              selected ? 'Quantity' : 'Quantity / Requirement'
            }
            required={Boolean(selected)}
          />

          <textarea
            name="message"
            placeholder="Tell us more about your requirement..."
          />

          {notice && (
            <p className="form-notice">
              {notice}
            </p>
          )}

          <Btn
            type="submit"
            disabled={sending}
          >
            {sending
              ? 'Sending…'
              : selected
                ? 'Place order request'
                : 'Send enquiry'}
          </Btn>
        </form>
      </section>

      {/* Google Maps Below Contact Form */}
      <section className="map-section">
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps?q=13.0584917,80.2146022&z=17&output=embed"
            width="100%"
            height="400"
            style={{
              border: 0,
              borderRadius: '12px',
              display: 'block'
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title="Raja Electricals Location"
          />
        </div>
      </section>
    </>
  );
}
