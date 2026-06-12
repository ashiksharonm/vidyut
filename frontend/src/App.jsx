import React, { useState, useEffect } from 'react';
import { 
  Battery, 
  Sun, 
  Zap, 
  AlertCircle, 
  Activity, 
  CloudRain, 
  CloudSun,
  Server
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Clean up any trailing slashes from the environment variable
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Ensure it ends with /api if the user forgot it, and remove trailing slashes
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
const FINAL_API_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

function App() {
  const [state, setState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState('en');
  const [error, setError] = useState(null);

  const t = {
    en: {
      title: 'Vidyut Microgrid Manager',
      gridStatus: 'Grid Status',
      battery: 'Battery Level',
      solar: 'Solar Generation',
      essential: 'Essential Load',
      nonEssential: 'Non-Essential Load',
      connected: 'Connected',
      disconnected: 'Shed / Disconnected',
      aiLog: 'Explainable AI Log',
      simulateCloud: 'Simulate Heavy Clouds',
      simulateClear: 'Simulate Clear Sky',
      simulateDrain: 'Simulate Battery Drain',
    },
    hi: {
      title: 'विद्युत माइक्रोग्रिड मैनेजर (Vidyut Microgrid)',
      gridStatus: 'ग्रिड स्थिति (Grid Status)',
      battery: 'बैटरी स्तर (Battery)',
      solar: 'सौर ऊर्जा (Solar)',
      essential: 'आवश्यक भार (Essential)',
      nonEssential: 'गैर-आवश्यक भार (Non-Essential)',
      connected: 'जुड़ा हुआ (Connected)',
      disconnected: 'काट दिया गया (Disconnected)',
      aiLog: 'एआई निर्णय लॉग (AI Log)',
      simulateCloud: 'बादलों का अनुकरण करें',
      simulateClear: 'साफ आसमान का अनुकरण करें',
      simulateDrain: 'बैटरी कम करें',
    }
  };

  const fetchData = async () => {
    try {
      const stateRes = await fetch(`${FINAL_API_URL}/state`);
      if (!stateRes.ok) throw new Error(`Backend returned ${stateRes.status}`);
      const stateData = await stateRes.json();
      
      // Ensure we received valid data
      if (stateData.battery_level === undefined) throw new Error('Invalid data format');
      
      setState(stateData);
      setError(null);
      
      setHistory(prev => {
        const newHist = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          generation: stateData.solar_generation_kw,
          load: stateData.essential_load_kw + (stateData.is_non_essential_connected ? stateData.non_essential_load_kw : 0)
        }];
        return newHist.slice(-20); // Keep last 20 points
      });

      const logsRes = await fetch(`${FINAL_API_URL}/logs`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError(`Cannot connect to backend: ${FINAL_API_URL}`);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const overrideWeather = async (modifier) => {
    await fetch(`${API_URL}/override/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloud_cover: modifier })
    });
  };

  const overrideBattery = async (level) => {
    await fetch(`${API_URL}/override/battery?level=${level}`, { method: 'POST' });
  };

  if (!state) return <div className="dashboard-container">Loading...</div>;

  const text = t[lang];

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-title">
          <Zap size={28} color="var(--accent-blue)" />
          {text.title}
        </div>
        <button 
          className="language-toggle" 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        >
          {lang === 'en' ? 'हिन्दी (Hindi)' : 'English'}
        </button>
      </header>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl mb-6">
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      <div className="controls-panel" style={{ marginBottom: '1.5rem' }}>
        <button className="btn" onClick={() => overrideWeather(0.2)}>
          <CloudRain size={18} /> {text.simulateCloud}
        </button>
        <button className="btn" onClick={() => overrideWeather(1.0)}>
          <CloudSun size={18} /> {text.simulateClear}
        </button>
        <button className="btn" onClick={() => overrideBattery(25.0)}>
          <Battery size={18} /> {text.simulateDrain}
        </button>
      </div>

      <div className="grid-layout">
        {/* Left Column: Stats and Charts */}
        <div className="glass-card">
          <div className="card-header">
            <Activity size={20} />
            {text.gridStatus}
            <div className={`status-indicator status-${state.grid_status}`} style={{ marginLeft: 'auto' }}>
              <div className="status-dot"></div>
              {state.grid_status}
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-label">{text.battery}</div>
              <div className="stat-value" style={{ color: state.battery_level < 30 ? 'var(--status-critical)' : 'inherit' }}>
                {state.battery_level.toFixed(1)}<span className="stat-unit">%</span>
              </div>
              <div className="battery-container">
                <div 
                  className="battery-fill" 
                  style={{ 
                    width: `${state.battery_level}%`,
                    backgroundColor: state.battery_level > 60 ? 'var(--status-normal)' : state.battery_level > 30 ? 'var(--status-warning)' : 'var(--status-critical)'
                  }}
                ></div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">{text.solar}</div>
              <div className="stat-value" style={{ color: 'var(--status-warning)' }}>
                {state.solar_generation_kw.toFixed(1)}<span className="stat-unit"> kW</span>
              </div>
              <div className="stat-label" style={{ marginTop: '0.5rem', textTransform: 'none', color: state.cloud_cover_modifier < 0.5 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                Weather Modifier: {state.cloud_cover_modifier.toFixed(2)}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">{text.essential}</div>
              <div className="stat-value">
                {state.essential_load_kw.toFixed(1)}<span className="stat-unit"> kW</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">{text.nonEssential}</div>
              <div className="stat-value" style={{ color: state.is_non_essential_connected ? 'inherit' : 'var(--text-secondary)' }}>
                {state.is_non_essential_connected ? state.non_essential_load_kw.toFixed(1) : '0.0'}
                <span className="stat-unit"> kW</span>
              </div>
              <div className={`status-indicator ${state.is_non_essential_connected ? 'status-Normal' : 'status-Critical'}`} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                <div className="status-dot"></div>
                {state.is_non_essential_connected ? text.connected : text.disconnected}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: '250px', marginTop: '2rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `${val}kW`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--surface-border)', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="generation" stroke="var(--status-warning)" strokeWidth={3} dot={false} name="Solar Generation" />
                <Line type="monotone" dataKey="load" stroke="var(--status-critical)" strokeWidth={3} dot={false} name="Total Load" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: AI Action Logs */}
        <div className="glass-card">
          <div className="card-header">
            <Server size={20} />
            {text.aiLog}
          </div>
          
          <div className="logs-container">
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Waiting for AI agent actions...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <div className="log-time">{new Date(log.timestamp * 1000).toLocaleTimeString()}</div>
                  <div className="log-message">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
