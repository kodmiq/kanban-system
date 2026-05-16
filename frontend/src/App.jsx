import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Иконки
import { FaPlus, FaCheckCircle, FaTrashAlt, FaSearch, FaUserCircle, FaBell, FaComments, FaRegFileAlt, FaSignal, FaRegCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { FiLayout } from 'react-icons/fi';

import Login from './Login';
import Register from './Register';

const API_URL = 'http://127.0.0.1:8080';

const appStyles = {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#0d0d0d',
    color: '#e0e0e0',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    overflow: 'hidden',
    boxSizing: 'border-box'
};

// --- КОМПОНЕНТ КОЛОНКИ ---
const KanbanColumn = ({ col, tasks, handleKillTask, handleMoveTask, onAddTaskClick }) => {
    const columnTasks = tasks.filter(t => t.status === col.status);

    return (
        <div style={{ 
            width: '340px', // Четкая, фиксированная ширина колонок как в оригинале
            flexShrink: 0,
            backgroundColor: '#16161a', 
            borderRadius: '14px', 
            padding: '15px', 
            border: '1px solid #222227', 
            display: 'flex', 
            flexDirection: 'column',
            maxHeight: '100%', // Колонки занимают всю высоту
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#fff' }}>{col.title}</h3>
                <span style={{ backgroundColor: '#222227', color: '#aaa', borderRadius: '50px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' }}>
                    {columnTasks.length}
                </span>
            </div>

            <button 
                onClick={() => onAddTaskClick(col.status)}
                style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', color: '#646cff', border: '1px dashed #33333f', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px', fontSize: '13px', transition: '0.2s', flexShrink: 0 }}
            >
                <FaPlus fontSize="11px" /> Добавить задачу
            </button>
            
            {/* Внутренний вертикальный скролл для карточек */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}>
                {columnTasks.map((task) => (
                    <div 
                        key={task.id}
                        style={{ 
                            backgroundColor: '#1b1b22', 
                            padding: '14px', 
                            borderRadius: '10px', 
                            border: '1px solid #2a2a32',
                            borderLeft: task.priority === 'High' ? '4px solid #ff4d4d' : task.priority === 'Medium' ? '4px solid #ffaa00' : '4px solid #4caf50',
                            flexShrink: 0,
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflow: 'hidden' }}>
                                <FaCheckCircle style={{ color: task.status === 'Done' ? '#4caf50' : '#444', fontSize: '13px', flexShrink: 0 }}/>
                                <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</h4>
                            </div>
                            <div style={{ textAlign: 'right', color: '#777', fontSize: '10px', flexShrink: 0, marginLeft: '8px' }}>
                                <div style={{ fontWeight: '600', color: '#aaa', marginBottom: '2px' }}>{task.id}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}><FaRegCalendarAlt /> 27 Авг</div>
                            </div>
                        </div>
                        
                        {task.description && <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#aaa', lineHeight: '1.4', wordBreak: 'break-word' }}>{task.description}</p>}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #26262f', paddingTop: '8px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {task.status !== 'To Do' && (
                                    <button 
                                        onClick={() => handleMoveTask(task.id, task.status, 'prev')} 
                                        style={{ backgroundColor: '#222227', color: '#aaa', border: '1px solid #2a2a32', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <FaArrowLeft fontSize="9px" />
                                    </button>
                                )}
                                
                                <div style={{ fontSize: '10px', padding: '3px 6px', borderRadius: '4px', backgroundColor: task.priority === 'High' ? 'rgba(255, 77, 77, 0.15)' : task.priority === 'Medium' ? 'rgba(255, 170, 0, 0.15)' : 'rgba(76, 175, 80, 0.15)', color: task.priority === 'High' ? '#ff4d4d' : task.priority === 'Medium' ? '#ffaa00' : '#4caf50', fontWeight: '600' }}>
                                    {task.priority === 'High' ? 'Важно' : task.priority === 'Medium' ? 'Средне' : 'Низкий'}
                                </div>

                                {task.status !== 'Done' && (
                                    <button 
                                        onClick={() => handleMoveTask(task.id, task.status, 'next')} 
                                        style={{ backgroundColor: '#222227', color: '#aaa', border: '1px solid #2a2a32', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <FaArrowRight fontSize="9px" />
                                    </button>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {task.assignee && <span style={{ fontSize: '10px', color: '#888', backgroundColor: '#222227', padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>👤 {task.assignee}</span>}
                                <button onClick={() => handleKillTask(task.id)} style={{ backgroundColor: 'transparent', color: '#ff4d4d', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                    <FaTrashAlt fontSize="11px" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- КОМПОНЕНТ SIDEBAR ---
const Sidebar = ({ username, handleLogout, taskCount }) => (
    <div style={{ width: '230px', backgroundColor: '#111114', borderRight: '1px solid #1e1e24', display: 'flex', flexDirection: 'column', padding: '15px', flexShrink: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #1e1e24' }}>
            <FaUserCircle style={{ fontSize: '36px', color: '#646cff', flexShrink: 0 }}/>
            <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{username}</div>
                <div style={{ color: '#666', fontSize: '11px' }}>Команда ЮГиль</div>
            </div>
        </div>
        
        <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
                { icon: FiLayout, label: 'Мои задачи', badge: taskCount },
                { icon: FaRegFileAlt, label: 'Личные чаты' },
                { icon: FaComments, label: 'Лента событий' },
                { icon: FaSignal, label: 'Отчеты' }
            ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', color: i === 0 ? '#fff' : '#999', backgroundColor: i === 0 ? '#1b1b22' : 'transparent', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <item.icon style={{ fontSize: '14px', color: i === 0 ? '#646cff' : '#555' }} />
                        <span style={{ fontSize: '13px' }}>{item.label}</span>
                    </div>
                    {item.badge !== undefined && <span style={{ color: '#666', fontSize: '11px', fontWeight: '600' }}>{item.badge}</span>}
                </div>
            ))}
        </nav>
        
        <button onClick={handleLogout} style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', flexShrink: 0 }}>
            Выйти из аккаунта
        </button>
    </div>
);

// --- ОСНОВНОЙ КОМПОНЕНТ ДОСКИ ---
const KanbanBoard = () => {
    const username = localStorage.getItem('username') || 'Пользователь';
    const navigate = useNavigate();
    
    const [tasks, setTasks] = useState([]);
    
    const [showForm, setShowForm] = useState(false);
    const [targetStatus, setTargetStatus] = useState('To Do');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignee, setAssignee] = useState('');

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/tasks`);
            setTasks(response.data || []);
        } catch (error) {
            console.error('Ошибка при получении задач:', error);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('username')) {
            navigate('/login');
        } else {
            fetchTasks();
        }
    }, []);

    const openAddTaskForm = (status) => {
        setTargetStatus(status);
        setShowForm(true);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/tasks`, {
                title,
                description,
                priority,
                assignee,
                status: targetStatus
            });
            setTitle('');
            setDescription('');
            setAssignee('');
            setShowForm(false);
            fetchTasks();
        } catch (error) {
            alert('Не удалось создать задачу');
        }
    };

    const handleMoveTask = async (id, currentStatus, direction) => {
        let newStatus = currentStatus;
        if (currentStatus === 'To Do' && direction === 'next') newStatus = 'In Progress';
        else if (currentStatus === 'In Progress' && direction === 'prev') newStatus = 'To Do';
        else if (currentStatus === 'In Progress' && direction === 'next') newStatus = 'Done';
        else if (currentStatus === 'Done' && direction === 'prev') newStatus = 'In Progress';

        if (newStatus === currentStatus) return;

        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

        try {
            await axios.put(`${API_URL}/tasks/${id}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            fetchTasks();
        }
    };

    const handleKillTask = async (id) => {
        if (!window.confirm('Удалить эту задачу?')) return;
        try {
            await axios.delete(`${API_URL}/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const columns = [
        { title: 'Нужно сделать', status: 'To Do' },
        { title: 'В работе', status: 'In Progress' },
        { title: 'Готово', status: 'Done' }
    ];

    return (
        <div style={appStyles}>
            <Sidebar username={username} handleLogout={handleLogout} taskCount={tasks.length} />
            
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                {/* Хедер */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 30px', borderBottom: '1px solid #1e1e24', backgroundColor: '#111114', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1b1b22', padding: '6px 12px', borderRadius: '50px', border: '1px solid #2a2a32', width: '240px' }}>
                        <FaSearch style={{ color: '#555', fontSize: '12px' }}/>
                        <input type="text" placeholder="Поиск по компании" style={{ backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '12px', width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa' }}>
                        <FaBell style={{ cursor: 'pointer', fontSize: '14px' }}/>
                        <button style={{ padding: '6px 14px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '50px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            + Создать чат
                        </button>
                    </div>
                </div>

                {/* Центрирующий контейнер с лимитом ширины */}
                <div style={{ display: 'flex', justifyContent: 'center', flexGrow: 1, overflow: 'hidden' }}>
                    <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column' }}>
                        {/* Табы проекта */}
                        <div style={{ padding: '10px 30px 5px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {['Исследования', 'Дизайн', 'Программирование'].map((tab, i) => (
                                    <div key={i} style={{ padding: '5px 12px', borderRadius: '50px', fontSize: '13px', fontWeight: i === 2 ? '600' : '400', color: i === 2 ? '#fff' : '#888', backgroundColor: i === 2 ? '#1b1b22' : 'transparent', cursor: 'pointer' }}>
                                        {tab}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Зона доски с ГОРИЗОНТАЛЬНЫМ скроллом, если колонок много */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '15px', 
                            padding: '15px 30px 30px 30px', 
                            flexGrow: 1, 
                            overflowX: 'auto', // Скролл теперь здесь!
                            alignItems: 'stretch',
                            boxSizing: 'border-box',
                            height: '100%'
                        }}>
                            {columns.map(col => (
                                <KanbanColumn key={col.status} col={col} tasks={tasks} handleKillTask={handleKillTask} handleMoveTask={handleMoveTask} onAddTaskClick={openAddTaskForm} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Модальное окно создания задачи (без изменений) */}
                {showForm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <form onSubmit={handleCreateTask} style={{ backgroundColor: '#16161a', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a32', width: '360px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px' }}>Новая задача ({targetStatus})</h3>
                            <input type="text" placeholder="Название задачи *" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a32', backgroundColor: '#1b1b22', color: '#fff', outline: 'none', fontSize: '13px' }} required />
                            <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a32', backgroundColor: '#1b1b22', color: '#fff', outline: 'none', minHeight: '50px', resize: 'vertical', fontSize: '13px' }} />
                            <input type="text" placeholder="Исполнитель" value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a32', backgroundColor: '#1b1b22', color: '#fff', outline: 'none', fontSize: '13px' }} />
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #2a2a32', backgroundColor: '#1b1b22', color: '#fff', outline: 'none', fontSize: '13px' }}>
                                <option value="Low">Низкий (Не срочно)</option>
                                <option value="Medium">Средний (Средне)</option>
                                <option value="High">Высокий (Очень важно)</option>
                            </select>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', backgroundColor: '#222227', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Отмена</button>
                                <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Сохранить</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/board" element={<KanbanBoard />} />
            </Routes>
        </Router>
    );
}

export default App;