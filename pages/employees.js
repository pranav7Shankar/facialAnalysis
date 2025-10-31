import { useEffect, useState } from 'react';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', gender: '', age: '', department: '' });
    const [image, setImage] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            setEmployees(data.employees || []);
        } catch (e) {
            setError('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('gender', form.gender);
        fd.append('age', form.age);
        fd.append('department', form.department);
        if (image) fd.append('image', image);
        try {
            const res = await fetch('/api/employees', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Create failed');
            setForm({ name: '', gender: '', age: '', department: '' });
            setImage(null);
            await fetchEmployees();
        } catch (e) {
            setError('Failed to create employee');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Employees</h1>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input className="border rounded p-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="border rounded p-2" placeholder="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} />
                <input className="border rounded p-2" placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                <input className="border rounded p-2" placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                <input className="border rounded p-2" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
                <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>Add Employee</button>
            </form>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map(emp => (
                        <div key={emp.id} className="border rounded p-4">
                            {emp.employee_image && <img src={emp.employee_image} alt={emp.name} className="w-full h-40 object-cover rounded mb-2" />}
                            <div className="font-semibold">{emp.name}</div>
                            <div className="text-sm text-slate-600">{emp.gender} • {emp.age} • {emp.department}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


