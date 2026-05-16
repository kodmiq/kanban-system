import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/register', {
                username,
                password
            });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Ошибка регистрации');
        }
    };

    return (
        <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#242424' }}>
            <h2>Регистрация</h2>
            <form onSubmit={handleRegister}>
                <input 
                    type="text" 
                    placeholder="Придумайте логин" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' }}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Придумайте пароль" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' }}
                    required
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Создать аккаунт
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
            <p style={{ marginTop: '15px' }}>
                Уже есть аккаунт? <Link to="/login" style={{ color: '#646cff' }}>Войти</Link>
            </p>
        </div>
    );
};

export default Register;