import React, { useState } from 'react';
import './TireInventoryForm.css';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface TireData {
  brand: string;
  model: string;
  tire_size: string;
  manufacturing_year: string;
  unit_price: string | number;
  purchased_qty: number | '';
  sold_qty: number | '';
  remarks: string;
}

interface Props {
  onSaved?: () => void; // callback เพื่อ refresh list
}

const EMPTY_FORM: TireData = {
  brand: '',
  model: '',
  tire_size: '',
  manufacturing_year: '',
  unit_price: '',
  purchased_qty: '',
  sold_qty: '',
  remarks: ''
};

const TireInventoryForm: React.FC<Props> = ({ onSaved }) => {
  const [formData, setFormData] = useState<TireData>(EMPTY_FORM);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Convert to number for specific fields
    const numberFields = ['purchased_qty', 'sold_qty'];
    let finalValue: string | number = value;

    if (numberFields.includes(name) && value !== '') {
      finalValue = Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/inventory/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData(EMPTY_FORM); // reset form ทันที
        showToast('บันทึกข้อมูลเรียบร้อยแล้ว!', 'success');
        onSaved?.(); // แจ้ง parent ให้ refresh list
      } else {
        showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล (Server Error)', 'error');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ (Network Error)', 'error');
    }
  };

  return (
    <div className="form-container">
      {/* Toast notification */}
      {toast && (
        <div className={`form-toast form-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="form-header">
        <h2>Tire Inventory</h2>
        <p>บันทึกข้อมูลสินค้าคงคลังยางรถยนต์</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="brand">Brand / ยี่ห้อ</label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange as any}
            required
            className="form-select"
          >
            <option value="" disabled>Select Brand</option>
            <option value="YOKO">YOKO</option>
            <option value="MAXXIS">MAXXIS</option>
            <option value="GITI">GITI</option>
            <option value="CON">CON</option>
            <option value="AUSTON">AUSTON</option>
            <option value="DUNLOP">DUNLOP</option>
            <option value="TOYO">TOYO</option>
            <option value="NEXEN">NEXEN</option>
            <option value="OTANI">OTANI</option>
            <option value="DESSTONE">DESSTONE</option>
            <option value="LENSO">LENSO</option>
            <option value="KINTO">KINTO</option>
            <option value="KILIN">KILIN</option>
            <option value="ROADX">ROADX</option>
            <option value="B/S">B/S</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="model">Model / รุ่น</label>
          <input
            type="text"
            id="model"
            name="model"
            placeholder="กรุณากรอกชื่อรุ่น"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tire_size">Tire Size / ขนาดยาง</label>
          <input
            type="text"
            id="tire_size"
            name="tire_size"
            placeholder="215/55R17"
            value={formData.tire_size}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="manufacturing_year">Manufacturing Year / ปีที่ผลิต</label>
          <input
            type="text"
            id="manufacturing_year"
            name="manufacturing_year"
            placeholder="2023"
            value={formData.manufacturing_year}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit_price">Unit Price / ราคาต่อหน่วย</label>
          <input
            type="text"
            id="unit_price"
            name="unit_price"
            placeholder="4500 หรือ ข้อความ"
            value={formData.unit_price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="purchased_qty">Purchased Qty / จำนวนที่รับเข้า</label>
          <input
            type="number"
            id="purchased_qty"
            name="purchased_qty"
            placeholder="10"
            value={formData.purchased_qty}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sold_qty">Sold Qty / จำนวนที่ขายออก</label>
          <input
            type="number"
            id="sold_qty"
            name="sold_qty"
            placeholder="0"
            value={formData.sold_qty}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="remarks">Remarks / หมายเหตุ</label>
          <textarea
            id="remarks"
            name="remarks"
            placeholder="กรุณากรอกข้อความ"
            value={formData.remarks}
            onChange={handleChange}
            rows={3}
          ></textarea>
        </div>

        <div className="form-group full-width form-actions">
          <button type="submit" className="submit-btn">
            Save Inventory
          </button>
        </div>
      </form>
    </div>
  );
};

export default TireInventoryForm;
