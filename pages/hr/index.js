import { useEffect, useState } from 'react';

export async function getServerSideProps({ req }) {
    const cookies = req.headers.cookie || '';
    const authed = cookies.includes('hr_auth=1');
    if (!authed) {
        return { redirect: { destination: '/hr/login', permanent: false } };
    }
    return { props: {} };
}

export default function HRDashboard() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', gender: '', age: '', department: '' });
    const [image, setImage] = useState(null);
    const [editing, setEditing] = useState(null);

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

    const createEmployee = async (e) => {
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

    const startEdit = (emp) => {
        setEditing(emp);
        setForm({ name: emp.name || '', gender: emp.gender || '', age: emp.age || '', department: emp.department || '' });
        setImage(null);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editing) return;
        const fd = new FormData();
        if (form.name) fd.append('name', form.name);
        if (form.gender) fd.append('gender', form.gender);
        if (form.age) fd.append('age', form.age);
        if (form.department) fd.append('department', form.department);
        if (image) fd.append('image', image);
        try {
            const res = await fetch(`/api/employees/${editing.id}`, { method: 'PUT', body: fd });
            if (!res.ok) throw new Error('Update failed');
            setEditing(null);
            setForm({ name: '', gender: '', age: '', department: '' });
            setImage(null);
            await fetchEmployees();
        } catch (e) {
            setError('Failed to update employee');
        }
    };

    const remove = async (emp) => {
        if (!confirm('Delete this employee?')) return;
        try {
            const res = await fetch(`/api/employees/${emp.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            await fetchEmployees();
        } catch (e) {
            setError('Failed to delete employee');
        }
    };

    const logout = async () => {
        await fetch('/api/hr/logout', { method: 'POST' });
        window.location.href = '/hr/login';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">HR Dashboard</h1>
                <button onClick={logout} className="px-3 py-1 bg-slate-200 rounded">Logout</button>
            </div>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <form onSubmit={editing ? saveEdit : createEmployee} className="border rounded-xl p-4 bg-white">
                    <h2 className="font-semibold mb-3">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
                    <input className="border rounded p-2 mb-2 w-full" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <input className="border rounded p-2 mb-2 w-full" placeholder="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} />
                    <input className="border rounded p-2 mb-2 w-full" placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                    <input className="border rounded p-2 mb-2 w-full" placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                    <input className="border rounded p-2 mb-3 w-full" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? 'Save' : 'Add'}</button>
                        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name:'', gender:'', age:'', department:'' }); setImage(null); }} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>}
                    </div>
                </form>

                <div className="border rounded-xl p-4 bg-white">
                    <h2 className="font-semibold mb-3">Employees ({employees.length})</h2>
                    {loading ? <div>Loading...</div> : (
                        <div className="space-y-3 max-h-[32rem] overflow-y-auto">
                            {employees.map(emp => (
                                <div key={emp.id} className="border rounded p-3 flex items-center gap-3">
                                    {emp.employee_image && <img src={emp.employee_image} alt={emp.name} className="w-16 h-16 object-cover rounded" />}
                                    <div className="flex-1">
                                        <div className="font-semibold">{emp.name}</div>
                                        <div className="text-sm text-slate-600">{emp.gender} • {emp.age} • {emp.department}</div>
                                    </div>
                                    <button onClick={() => startEdit(emp)} className="px-3 py-1 bg-amber-500 text-white rounded">Edit</button>
                                    <button onClick={() => remove(emp)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


