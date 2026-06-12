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
      waiting: 'Waiting for AI agent actions...',
      langName: 'English'
    },
    hi: {
      title: 'विद्युत माइक्रोग्रिड मैनेजर',
      gridStatus: 'ग्रिड स्थिति',
      battery: 'बैटरी स्तर',
      solar: 'सौर ऊर्जा',
      essential: 'आवश्यक भार',
      nonEssential: 'गैर-आवश्यक भार',
      connected: 'जुड़ा हुआ',
      disconnected: 'काट दिया गया',
      aiLog: 'एआई निर्णय लॉग',
      simulateCloud: 'बादलों का अनुकरण करें',
      simulateClear: 'साफ आसमान का अनुकरण करें',
      simulateDrain: 'बैटरी कम करें',
      waiting: 'एआई एजेंट की प्रतीक्षा कर रहा है...',
      langName: 'हिन्दी'
    },
    ta: {
      title: 'வித்யுத் மைக்ரோகிரிட் மேலாளர்',
      gridStatus: 'கிரிட் நிலை',
      battery: 'பேட்டரி நிலை',
      solar: 'சூரிய சக்தி',
      essential: 'அத்தியாவசிய சுமை',
      nonEssential: 'அத்தியாவசியமற்ற சுமை',
      connected: 'இணைக்கப்பட்டுள்ளது',
      disconnected: 'துண்டிக்கப்பட்டது',
      aiLog: 'AI முடிவு பதிவு',
      simulateCloud: 'மேகங்களை உருவகப்படுத்து',
      simulateClear: 'தெளிவான வானத்தை உருவகப்படுத்து',
      simulateDrain: 'பேட்டரியை குறை',
      waiting: 'AI முகவர் செயல்களுக்காக காத்திருக்கிறது...',
      langName: 'தமிழ்'
    },
    te: {
      title: 'విద్యుత్ మైక్రోగ్రిడ్ మేనేజర్',
      gridStatus: 'గ్రిడ్ స్థితి',
      battery: 'బ్యాటరీ స్థాయి',
      solar: 'సౌర శక్తి',
      essential: 'అవసరమైన లోడ్',
      nonEssential: 'అనవసరమైన లోడ్',
      connected: 'కనెక్ట్ చేయబడింది',
      disconnected: 'డిస్‌కనెక్ట్ చేయబడింది',
      aiLog: 'AI నిర్ణయ లాగ్',
      simulateCloud: 'మేఘాలను అనుకరించండి',
      simulateClear: 'స్పష్టమైన ఆకాశాన్ని అనుకరించండి',
      simulateDrain: 'బ్యాటరీని తగ్గించండి',
      waiting: 'AI ఏజెంట్ చర్యల కోసం వేచి ఉంది...',
      langName: 'తెలుగు'
    },
    bn: {
      title: 'বিদ্যুৎ মাইক্রোগ্রিড ম্যানেজার',
      gridStatus: 'গ্রিড স্থিতি',
      battery: 'ব্যাটারি স্তর',
      solar: 'সৌর শক্তি',
      essential: 'প্রয়োজনীয় লোড',
      nonEssential: 'অপ্রয়োজনীয় লোড',
      connected: 'সংযুক্ত',
      disconnected: 'বিচ্ছিন্ন',
      aiLog: 'এআই সিদ্ধান্ত লগ',
      simulateCloud: 'মেঘ অনুকরণ করুন',
      simulateClear: 'পরিষ্কার আকাশ অনুকরণ করুন',
      simulateDrain: 'ব্যাটারি কমান',
      waiting: 'এআই এজেন্টের জন্য অপেক্ষা করছে...',
      langName: 'বাংলা'
    }
  };

  const translateLog = (msg, lang) => {
    if (lang === 'en') return msg;

    const p1 = /Battery critical \((.*?)%\)\. Solar generation \((.*?)kW\) is insufficient for current demand \((.*?)kW\)\. Shedding non-essential agricultural load to protect essential services\./;
    const m1 = msg.match(p1);
    if (m1) {
      if (lang === 'hi') return `बैटरी गंभीर (${m1[1]}%)। वर्तमान मांग (${m1[3]}kW) के लिए सौर ऊर्जा (${m1[2]}kW) अपर्याप्त है। आवश्यक सेवाओं की सुरक्षा के लिए कृषि भार को काट दिया गया है।`;
      if (lang === 'ta') return `பேட்டரி ஆபத்தானது (${m1[1]}%). தற்போதைய தேவைக்கு (${m1[3]}kW) சூரிய உற்பத்தி (${m1[2]}kW) போதாது. அத்தியாவசிய சேவைகளைப் பாதுகாக்க விவசாயச் சுமை குறைக்கப்பட்டது.`;
      if (lang === 'te') return `బ్యాటరీ ప్రమాదకరం (${m1[1]}%). ప్రస్తుత డిమాండ్‌కు (${m1[3]}kW) సౌర ఉత్పత్తి (${m1[2]}kW) సరిపోదు. ముఖ్యమైన సేవలను రక్షించడానికి వ్యవసాయ లోడ్ కత్తిరించబడింది.`;
      if (lang === 'bn') return `ব্যাটারি আশঙ্কাজনক (${m1[1]}%)। বর্তমান চাহিদার (${m1[3]}kW) জন্য সৌর উৎপাদন (${m1[2]}kW) অপর্যাপ্ত। প্রয়োজনীয় পরিষেবা রক্ষার্থে কৃষি লোড কমানো হয়েছে।`;
    }

    const p2 = /Weather Prediction Alert: Heavy cloud cover detected\. Battery at (.*?)%\. Proactively shedding non-essential loads to conserve power for the night\./;
    const m2 = msg.match(p2);
    if (m2) {
      if (lang === 'hi') return `मौसम भविष्यवाणी अलर्ट: घने बादलों का अनुमान। बैटरी ${m2[1]}% पर। रात के लिए बिजली बचाने के लिए गैर-आवश्यक भार को सक्रिय रूप से काट दिया गया है।`;
      if (lang === 'ta') return `வானிலை எச்சரிக்கை: மேகமூட்டம் கண்டறியப்பட்டது. பேட்டரி ${m2[1]}%. இரவுக்கு மின்சாரத்தை சேமிக்க அத்தியாவசியமற்ற சுமைகள் முன்கூட்டியே குறைக்கப்பட்டன.`;
      if (lang === 'te') return `వాతావరణ హెచ్చరిక: మేఘావృతం ఉన్నట్లు గుర్తించబడింది. బ్యాటరీ ${m2[1]}%. రాత్రికి విద్యుత్‌ను ఆదా చేయడానికి అనవసరమైన లోడ్‌లు తొలగించబడ్డాయి.`;
      if (lang === 'bn') return `আবহাওয়ার পূর্বাভাস: ঘন মেঘ শনাক্ত হয়েছে। ব্যাটারি ${m2[1]}%। রাতের জন্য বিদ্যুৎ বাঁচাতে অপ্রয়োজনীয় লোড আগে থেকেই কমানো হয়েছে।`;
    }

    const p3 = /Grid stabilized\. Battery healthy \((.*?)%\)\. Solar generation is optimal\. Reconnecting non-essential agricultural pumps\./;
    const m3 = msg.match(p3);
    if (m3) {
      if (lang === 'hi') return `ग्रिड स्थिर हो गया। बैटरी स्वस्थ है (${m3[1]}%)। सौर उत्पादन इष्टतम है। कृषि पंपों को फिर से जोड़ा जा रहा है।`;
      if (lang === 'ta') return `கிரிட் சீரானது. பேட்டரி சீராக உள்ளது (${m3[1]}%). சூரிய உற்பத்தி உகந்தது. விவசாய பம்புகள் மீண்டும் இணைக்கப்படுகின்றன.`;
      if (lang === 'te') return `గ్రిడ్ స్థిరీకరించబడింది. బ్యాటరీ ఆరోగ్యంగా ఉంది (${m3[1]}%). సౌర ఉత్పత్తి ఆశాజనకంగా ఉంది. వ్యవసాయ పంపులు మళ్లీ కనెక్ట్ చేయబడుతున్నాయి.`;
      if (lang === 'bn') return `গ্রিড স্থিতিশীল। ব্যাটারি ভালো আছে (${m3[1]}%)। সৌর উৎপাদন অনুকূল। কৃষি পাম্প পুনরায় সংযুক্ত করা হচ্ছে।`;
    }

    return msg; // Fallback
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
    await fetch(`${FINAL_API_URL}/override/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloud_cover: modifier })
    });
  };

  const overrideBattery = async (level) => {
    await fetch(`${FINAL_API_URL}/override/battery?level=${level}`, { method: 'POST' });
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
        <select 
          className="language-toggle bg-gray-800 text-white p-2 rounded border border-gray-600" 
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="bn">বাংলা (Bengali)</option>
        </select>
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
                {text.waiting}
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <div className="log-time">{new Date(log.timestamp * 1000).toLocaleTimeString()}</div>
                  <div className="log-message">{translateLog(log.message, lang)}</div>
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
