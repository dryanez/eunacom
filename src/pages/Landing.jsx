import { Link } from 'react-router-dom'

function Landing() {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>🎓 EUNACOM Study Platform</h1>
            <p>Master the exam with our adaptive testing engine.</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                <Link to="/login" className="control-btn start">Login</Link>
                <Link to="/admin" className="control-btn stop">Admin Access</Link>
            </div>
        </div>
    )
}

export default Landing
