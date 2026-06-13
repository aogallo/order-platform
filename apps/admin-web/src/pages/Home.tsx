import './Home.css'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <section className="home__hero">
        <h1 className="home__title">Welcome to Order Platform</h1>
        <p className="home__subtitle">
          Create and track your orders in real time.
        </p>
        <div className="home__actions">
          <Link to="/orders/new" className="home__cta home__cta--primary">
            Create an Order
          </Link>
          <Link to="/tracking" className="home__cta home__cta--secondary">
            Track an Order
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
