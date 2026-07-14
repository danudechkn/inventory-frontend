import React, { useEffect, useState, useMemo, useDeferredValue } from 'react';
import './InventoryList.css';

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  tire_size: string;
  manufacturing_year: string;
  unit_price: string | number;
  purchased_qty: number;
  sold_qty: number;
  remarks: string;
}

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchBrand, setSearchBrand] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [searchYear, setSearchYear] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/inventory/get`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setInventory(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/inventory/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error('Failed to update item');
      
      setInventory(inventory.map((item) => (item.id === id ? { ...item, ...editForm as InventoryItem } : item)));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Error updating item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/inventory/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      
      setInventory(inventory.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting item');
    }
  };

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const deferredSearchBrand = useDeferredValue(searchBrand);
  const deferredSearchSize = useDeferredValue(searchSize);
  const deferredSearchYear = useDeferredValue(searchYear);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      return (
        (!deferredSearchBrand || (item.brand && item.brand.toLowerCase().includes(deferredSearchBrand.toLowerCase()))) &&
        (!deferredSearchSize || (item.tire_size && item.tire_size.toLowerCase().includes(deferredSearchSize.toLowerCase()))) &&
        (!deferredSearchYear || (item.manufacturing_year && item.manufacturing_year.toLowerCase().includes(deferredSearchYear.toLowerCase())))
      );
    });
  }, [inventory, deferredSearchBrand, deferredSearchSize, deferredSearchYear]);

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Inventory Data</h2>
        <p>รายการสินค้าคงคลังยางรถยนต์ทั้งหมด</p>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="ค้นหายี่ห้อ (Brand)" 
          value={searchBrand}
          onChange={(e) => setSearchBrand(e.target.value)}
          className="search-input"
        />
        <input 
          type="text" 
          placeholder="ค้นหาขนาดยาง (Size)" 
          value={searchSize}
          onChange={(e) => setSearchSize(e.target.value)}
          className="search-input"
        />
        <input 
          type="text" 
          placeholder="ค้นหาปีที่ผลิต (Year)" 
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Brand / ยี่ห้อ</th>
              <th>Model / รุ่น</th>
              <th>Size / ขนาดยาง</th>
              <th>Year / ปีที่ผลิต</th>
              <th>Price / ราคา</th>
              <th>In / รับเข้า</th>
              <th>Out / ขายออก</th>
              <th>Balance / คงเหลือ</th>
              <th>Actions / จัดการ</th>
            </tr>

          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-state">ไม่พบข้อมูลที่ค้นหา</td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    {isEditing ? (
                      <>
                        <td><input type="text" value={editForm.brand || ''} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} className="edit-input" /></td>
                        <td><input type="text" value={editForm.model || ''} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} className="edit-input" /></td>
                        <td><input type="text" value={editForm.tire_size || ''} onChange={(e) => setEditForm({ ...editForm, tire_size: e.target.value })} className="edit-input" /></td>
                        <td><input type="text" value={editForm.manufacturing_year || ''} onChange={(e) => setEditForm({ ...editForm, manufacturing_year: e.target.value })} className="edit-input" /></td>
                        <td><input type="number" value={editForm.unit_price || ''} onChange={(e) => setEditForm({ ...editForm, unit_price: e.target.value })} className="edit-input" /></td>
                        <td><input type="number" value={editForm.purchased_qty || ''} onChange={(e) => setEditForm({ ...editForm, purchased_qty: parseInt(e.target.value) || 0 })} className="edit-input" /></td>
                        <td><input type="number" value={editForm.sold_qty || ''} onChange={(e) => setEditForm({ ...editForm, sold_qty: parseInt(e.target.value) || 0 })} className="edit-input" /></td>
                        <td className="qty-balance">{(editForm.purchased_qty || 0) - (editForm.sold_qty || 0)}</td>
                        <td className="actions-cell">
                          <button onClick={() => handleSaveEdit(item.id)} className="save-btn">Save</button>
                          <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="brand-cell">{item.brand}</td>
                        <td>{item.model}</td>
                        <td>{item.tire_size}</td>
                        <td>{item.manufacturing_year}</td>
                        <td>฿{typeof item.unit_price === 'number' ? item.unit_price.toLocaleString() : (Number(item.unit_price) ? Number(item.unit_price).toLocaleString() : item.unit_price)}</td>
                        <td className="qty-in">{item.purchased_qty}</td>
                        <td className="qty-out">{item.sold_qty}</td>
                        <td className="qty-balance">{item.purchased_qty - item.sold_qty}</td>
                        <td className="actions-cell">
                          <button onClick={() => handleEditClick(item)} className="edit-btn">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="delete-btn">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
