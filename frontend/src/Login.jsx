import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/login', {
                username,
                password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            navigate('/board');
        } catch (error) {
            setError(error.response?.data?.error || 'Неверный логин или пароль');
        }
    };

    return (
        <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#242424' }}>
            <h2>Вход в систему</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Логин" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' }}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Пароль" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' }}
                    required
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Войти
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
            <p style={{ marginTop: '15px' }}>
                Нет аккаунта? <Link to="/register" style={{ color: '#646cff' }}>Зарегистрироваться</Link>
            </p>
        </div>
    );
};

export default Login;