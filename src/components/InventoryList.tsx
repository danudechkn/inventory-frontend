import React, { useEffect, useState, useCallback, useRef } from 'react';
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

// คงที่นอก component เพื่อไม่ให้สร้างซ้ำทุก render
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchBrand, setSearchBrand] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [searchYear, setSearchYear] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});

  // เก็บ snapshot เดิมไว้ revert ถ้า server error
  const prevInventoryRef = useRef<InventoryItem[]>([]);

  const fetchInventory = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`${apiUrl}/api/inventory/get`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setInventory(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleEditClick = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: number) => {
    // === Optimistic UI: อัปเดต UI ทันที ===
    const updated = { ...editForm as InventoryItem };
    prevInventoryRef.current = inventory;
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    setEditingId(null);

    try {
      const response = await fetch(`${apiUrl}/api/inventory/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error('Failed to update item');
      // ไม่ต้อง refetch — UI อัปเดตไปแล้ว
    } catch (err: any) {
      // Server error → revert กลับ
      setInventory(prevInventoryRef.current);
      setEditingId(id);
      setEditForm(updated);
      alert(err.message || 'Error updating item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;

    // === Optimistic UI: ลบออกจาก UI ทันที ===
    prevInventoryRef.current = inventory;
    setInventory(prev => prev.filter(item => item.id !== id));

    try {
      const response = await fetch(`${apiUrl}/api/inventory/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
    } catch (err: any) {
      // Server error → เอากลับมา
      setInventory(prevInventoryRef.current);
      alert(err.message || 'Error deleting item');
    }
  };


  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  const filteredInventory = inventory.filter((item) => {
    return (
      (!searchBrand || (item.brand && item.brand.toLowerCase().includes(searchBrand.toLowerCase()))) &&
      (!searchSize || (item.tire_size && item.tire_size.toLowerCase().includes(searchSize.toLowerCase()))) &&
      (!searchYear || (item.manufacturing_year && item.manufacturing_year.toLowerCase().includes(searchYear.toLowerCase())))
    );
  });

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
                        <td><input type="text" value={editForm.unit_price != null ? String(editForm.unit_price) : ''} onChange={(e) => setEditForm({ ...editForm, unit_price: e.target.value })} className="edit-input" /></td>
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
                        <td>{(() => { const p = item.unit_price; const n = Number(p); return !isNaN(n) && p !== '' ? `฿${n.toLocaleString()}` : String(p); })()}</td>
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
