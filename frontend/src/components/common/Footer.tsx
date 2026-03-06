import './Footer.scss'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {year} SQL Editor. All rights reserved.</p>
            </div>
        </footer>
    )
}
