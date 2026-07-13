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

  const [filterId, setFilterId] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [filterYear, setFilterYear] = useState('');

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
      (filterId === '' || item.id.toString().includes(filterId)) &&
      (filterBrand === '' || item.brand.toLowerCase().includes(filterBrand.toLowerCase())) &&
      (filterModel === '' || item.model.toLowerCase().includes(filterModel.toLowerCase())) &&
      (filterSize === '' || item.tire_size.toLowerCase().includes(filterSize.toLowerCase())) &&
      (filterYear === '' || item.manufacturing_year.toLowerCase().includes(filterYear.toLowerCase()))
    );
  });

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Inventory Data</h2>
        <p>รายการสินค้าคงคลังยางรถยนต์ทั้งหมด</p>
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
            <tr className="filter-row">
              <th><input type="text" placeholder="Filter..." value={filterId} onChange={(e) => setFilterId(e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></th>
              <th><input type="text" placeholder="Filter..." value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></th>
              <th><input type="text" placeholder="Filter..." value={filterModel} onChange={(e) => setFilterModel(e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></th>
              <th><input type="text" placeholder="Filter..." value={filterSize} onChange={(e) => setFilterSize(e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></th>
              <th><input type="text" placeholder="Filter..." value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">ไม่มีข้อมูลในระบบ</td>
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
