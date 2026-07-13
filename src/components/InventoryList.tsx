import React, { useEffect, useState } from 'react';
import './InventoryList.css';

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  tire_size: string;
  manufacturing_year: string;
  unit_price: number;
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

      <div className="search-container" style={{ marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="ค้นหายี่ห้อ (Brand)" 
          value={searchBrand}
          onChange={(e) => setSearchBrand(e.target.value)}
          className="search-input"
          style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" 
          placeholder="ค้นหาขนาดยาง (Size)" 
          value={searchSize}
          onChange={(e) => setSearchSize(e.target.value)}
          className="search-input"
          style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" 
          placeholder="ค้นหาปีที่ผลิต (Year)" 
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
          className="search-input"
          style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
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
            </tr>

          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">ไม่พบข้อมูลที่ค้นหา</td>
              </tr>
            ) : (
              filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="brand-cell">{item.brand}</td>
                  <td>{item.model}</td>
                  <td>{item.tire_size}</td>
                  <td>{item.manufacturing_year}</td>
                  <td>฿{item.unit_price.toLocaleString()}</td>
                  <td className="qty-in">{item.purchased_qty}</td>
                  <td className="qty-out">{item.sold_qty}</td>
                  <td className="qty-balance">
                    {item.purchased_qty - item.sold_qty}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
