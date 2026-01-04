import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`faq__item ${isOpen ? 'faq__item--active' : ''}`}>
            <button className="faq__question" aria-expanded={isOpen} onClick={onClick}>
                <span className="faq__question-text">{question}</span>
                <span className="faq__question-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" />
                    </svg>
                </span>
            </button>
            <div className="faq__answer">
                <div className="faq__answer-content">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [openFAQ, setOpenFAQ] = useState(0);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? -1 : index);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    // Intersection Observer for scroll animations
    React.useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.scroll-fade-in');
        animatedElements.forEach(el => observer.observe(el));

        return () => {
            animatedElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="landing-page-wrapper">
            <header className="header">
                <div className="container">
                    <nav className="header__nav">
                        {/* Logo */}
                        <a href="/" className="header__logo">
                            <svg viewBox="0 0 147 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd"
                                    d="M58.9036 18.5538V6.21206H62.4939V18.5538H58.9036ZM60.6987 4.49156C60.0391 4.49156 59.502 4.30038 59.0877 3.91806C58.6734 3.53573 58.4663 3.06163 58.4663 2.49578C58.4663 1.92993 58.6734 1.45583 59.0877 1.0735C59.502 0.691167 60.0391 0.5 60.6987 0.5C61.3584 0.5 61.8955 0.68352 62.3098 1.05056C62.7241 1.40231 62.9312 1.86111 62.9312 2.42696C62.9312 3.0234 62.7241 3.52043 62.3098 3.91806C61.9108 4.30038 61.374 4.49156 60.6987 4.49156ZM37.1754 18.5538V2.49578H40.2594L46.2939 12.4667L52.2273 2.49578H55.2883L55.3344 18.5538H51.8361L51.8153 8.91572L47.0719 16.8562H45.3918L40.6737 9.12333V18.5538H37.1754ZM39.3388 36.4115C40.4128 36.962 41.6556 37.2373 43.0673 37.2373C44.1872 37.2373 45.1769 37.0691 46.0362 36.7326C46.8956 36.3809 47.6091 35.8838 48.1767 35.2415L46.2664 33.1769C45.8521 33.5746 45.3918 33.8728 44.8855 34.0716C44.3944 34.2704 43.819 34.3698 43.1593 34.3698C42.4229 34.3698 41.7784 34.2398 41.2261 33.9798C40.6889 33.7045 40.2672 33.3146 39.9602 32.8099C39.8014 32.5267 39.6859 32.2208 39.6135 31.8923H48.9822C48.9974 31.7394 49.013 31.5788 49.0282 31.4105C49.0434 31.227 49.0512 31.0664 49.0512 30.9288C49.0512 29.5983 48.7673 28.4589 48.1997 27.5107C47.6321 26.5473 46.857 25.8132 45.8751 25.3085C44.9085 24.7885 43.819 24.5285 42.607 24.5285C41.3489 24.5285 40.2212 24.8038 39.2238 25.3544C38.2263 25.8897 37.4364 26.639 36.8532 27.6025C36.2855 28.5507 36.0016 29.6442 36.0016 30.8829C36.0016 32.1064 36.2931 33.1999 36.8762 34.1633C37.4594 35.1115 38.2801 35.8609 39.3388 36.4115ZM39.5723 29.8047C39.6321 29.4225 39.7461 29.0784 39.9142 28.7724C40.1752 28.283 40.5356 27.9084 40.9959 27.6484C41.4714 27.3731 42.0164 27.2355 42.63 27.2355C43.2436 27.2355 43.7808 27.3731 44.2411 27.6484C44.7014 27.9084 45.0618 28.2754 45.3228 28.7495C45.4958 29.0642 45.6116 29.4159 45.6699 29.8047H39.5723ZM56.6659 37.2373C55.638 37.2373 54.7174 37.0385 53.9041 36.6409C53.1063 36.2432 52.4849 35.6392 52.0399 34.8286C51.5951 34.0028 51.3724 32.9552 51.3724 31.6858V24.7121H54.9628V31.1582C54.9628 32.1828 55.1777 32.9399 55.6072 33.4293C56.0523 33.9033 56.6737 34.1404 57.4714 34.1404C58.0238 34.1404 58.5149 34.0257 58.9444 33.7963C59.3743 33.5516 59.7117 33.1846 59.9571 32.6952C60.2028 32.1905 60.3253 31.5635 60.3253 30.8141V24.7121H63.9157V37.0538H60.5094V35.6077C60.1709 36.0071 59.7644 36.3362 59.2896 36.595C58.4919 37.0232 57.6173 37.2373 56.6659 37.2373ZM77.3918 25.125C76.6245 24.7273 75.7499 24.5285 74.7681 24.5285C73.7094 24.5285 72.7657 24.7503 71.9372 25.1938C71.4483 25.4554 71.0266 25.7834 70.6714 26.178V24.7121H67.2421V37.0538H70.8325V30.9517C70.8325 30.1871 70.955 29.5601 71.2007 29.0707C71.4613 28.5813 71.8143 28.2219 72.2594 27.9925C72.7197 27.7478 73.2335 27.6254 73.8014 27.6254C74.5992 27.6254 75.2128 27.8625 75.6426 28.3366C76.0873 28.8107 76.3101 29.5447 76.3101 30.5388V37.0538H79.9004V29.9883C79.9004 28.7342 79.6777 27.7095 79.233 26.9143C78.7879 26.1037 78.1743 25.5073 77.3918 25.125ZM90.7499 37.0538V35.5202C90.4796 35.9732 90.1114 36.3391 89.6451 36.6179C88.9547 37.0308 88.0649 37.2373 86.9754 37.2373C86.0087 37.2373 85.1802 37.0767 84.4897 36.7556C83.7993 36.4191 83.2699 35.9679 82.9017 35.4021C82.5334 34.8363 82.3493 34.2016 82.3493 33.4981C82.3493 32.764 82.5257 32.1217 82.8787 31.5711C83.2469 31.0206 83.8223 30.5924 84.6048 30.2865C85.3873 29.9653 86.4078 29.8047 87.6658 29.8047H90.5197C90.5197 29.0401 90.2818 28.4436 89.8062 28.0154C89.3459 27.5872 88.6325 27.3731 87.6658 27.3731C87.0062 27.3731 86.354 27.4801 85.7095 27.6943C85.0803 27.8931 84.5436 28.1683 84.0985 28.5201L82.8096 26.0196C83.4849 25.5456 84.2978 25.1785 85.2492 24.9185C86.2007 24.6585 87.1673 24.5285 88.1491 24.5285C90.0364 24.5285 91.5016 24.9721 92.545 25.8591C93.5885 26.7461 94.1101 28.1301 94.1101 30.0112V37.0538H90.7499ZM90.5197 31.8923V33.154C90.3048 33.7045 89.9595 34.1251 89.484 34.4157C89.0085 34.691 88.4714 34.8286 87.873 34.8286C87.2438 34.8286 86.7452 34.6986 86.377 34.4386C86.024 34.1633 85.8476 33.7963 85.8476 33.3375C85.8476 32.9246 86.0009 32.5805 86.3079 32.3052C86.6301 32.0299 87.2133 31.8923 88.0571 31.8923H90.5197ZM99.8661 36.4344C100.909 36.9697 102.099 37.2373 103.433 37.2373C104.737 37.2373 105.873 36.9697 106.84 36.4344C107.806 35.8838 108.52 35.1115 108.98 34.1175L106.195 32.6034C105.873 33.1999 105.466 33.6357 104.975 33.911C104.5 34.171 103.978 34.301 103.41 34.301C102.796 34.301 102.244 34.1633 101.753 33.8881C101.262 33.6128 100.871 33.2228 100.58 32.7181C100.303 32.2134 100.165 31.6017 100.165 30.8829C100.165 30.1641 100.303 29.5524 100.58 29.0477C100.871 28.543 101.262 28.1531 101.753 27.8778C102.244 27.6025 102.796 27.4649 103.41 27.4649C103.978 27.4649 104.5 27.6025 104.975 27.8778C105.466 28.1531 105.873 28.5813 106.195 29.1624L108.98 27.6713C108.52 26.662 107.806 25.8897 106.84 25.3544C105.873 24.8038 104.737 24.5285 103.433 24.5285C102.099 24.5285 100.909 24.8038 99.8661 25.3544C98.8226 25.8897 98.0019 26.639 97.4035 27.6025C96.8203 28.5507 96.5289 29.6442 96.5289 30.8829C96.5289 32.1064 96.8203 33.1999 97.4035 34.1633C98.0019 35.1268 98.8226 35.8838 99.8661 36.4344ZM116.782 37.2373C115.462 37.2373 114.288 36.962 113.261 36.4115C112.248 35.8609 111.442 35.1115 110.844 34.1633C110.261 33.1999 109.969 32.1064 109.969 30.8829C109.969 29.6442 110.261 28.5507 110.844 27.6025C111.442 26.639 112.248 25.8897 113.261 25.3544C114.288 24.8038 115.462 24.5285 116.782 24.5285C118.086 24.5285 119.252 24.8038 120.28 25.3544C121.308 25.8897 122.114 26.6314 122.697 27.5796C123.28 28.5278 123.571 29.6289 123.571 30.8829C123.571 32.1064 123.28 33.1999 122.697 34.1633C122.114 35.1115 121.308 35.8609 120.28 36.4115C119.252 36.962 118.086 37.2373 116.782 37.2373ZM116.782 34.301C117.38 34.301 117.917 34.1633 118.393 33.8881C118.868 33.6128 119.244 33.2228 119.521 32.7181C119.797 32.1982 119.935 31.5864 119.935 30.8829C119.935 30.1641 119.797 29.5524 119.521 29.0477C119.244 28.543 118.868 28.1531 118.393 27.8778C117.917 27.6025 117.38 27.4649 116.782 27.4649C116.183 27.4649 115.646 27.6025 115.171 27.8778C114.695 28.1531 114.311 28.543 114.02 29.0477C113.744 29.5524 113.606 30.1641 113.606 30.8829C113.606 31.5864 113.744 32.1982 114.02 32.7181C114.311 33.2228 114.695 33.6128 115.171 33.8881C115.646 34.1633 116.183 34.301 116.782 34.301ZM144.429 25.125C143.677 24.7273 142.811 24.5285 141.829 24.5285C140.647 24.5285 139.596 24.8115 138.676 25.3773C138.16 25.6997 137.724 26.0866 137.367 26.5382C137.077 26.0753 136.708 25.696 136.259 25.4003C135.415 24.8191 134.425 24.5285 133.29 24.5285C132.277 24.5285 131.372 24.7503 130.574 25.1938C130.125 25.4398 129.733 25.7538 129.4 26.136V24.7121H125.971V37.0538H129.562V30.86C129.562 30.1259 129.677 29.5218 129.907 29.0477C130.137 28.5736 130.459 28.2219 130.873 27.9925C131.288 27.7478 131.755 27.6254 132.277 27.6254C133.029 27.6254 133.604 27.8625 134.003 28.3366C134.418 28.8107 134.625 29.5447 134.625 30.5388V37.0538H138.215V30.86C138.215 30.1259 138.33 29.5218 138.561 29.0477C138.791 28.5736 139.113 28.2219 139.527 27.9925C139.941 27.7478 140.409 27.6254 140.931 27.6254C141.683 27.6254 142.266 27.8625 142.68 28.3366C143.094 28.8107 143.302 29.5447 143.302 30.5388V37.0538H146.892V29.9883C146.892 28.7342 146.669 27.7095 146.225 26.9143C145.795 26.1037 145.196 25.5073 144.429 25.125ZM19.2933 3.79484C19.2933 5.56493 17.8536 6.9999 16.0777 6.9999C14.3018 6.9999 12.8622 5.56493 12.8622 3.79484C12.8622 2.02474 14.3018 0.58979 16.0777 0.58979C17.8536 0.58979 19.2933 2.02474 19.2933 3.79484ZM14.321 20.8895C12.8257 20.8895 10.9982 21.3532 9.6027 22.0487C10.5663 22.976 11.9286 23.1747 13.3906 23.1747C14.4207 23.1747 15.9824 22.5785 15.9824 21.7506C15.9824 20.9226 14.9191 20.8895 14.321 20.8895ZM23.824 32.2493L23.9237 32.3486C23.9237 32.3486 19.5377 37.1177 11.4302 37.1177C9.6027 37.1177 7.70874 36.8528 5.98093 36.1904C2.32591 34.7994 0 31.6862 0 27.9438V27.9107C0 24.7644 1.59491 22.5786 3.72148 20.4589C3.62181 19.7635 3.52209 19.0679 3.52209 18.3724C3.52209 12.6098 8.772 8.60241 14.6533 8.60241C18.8027 8.60241 22.0649 10.4449 23.5696 11.2946C23.812 11.4315 24.0087 11.5427 24.1563 11.6162C24.1563 11.6162 23.093 13.239 21.8304 15.5574C21.8304 15.5574 17.9428 13.239 14.5203 13.239C11.696 13.239 9.50303 14.2989 8.47295 16.7827C8.37328 17.0808 8.27361 17.3789 8.24039 17.677C10.2008 16.849 12.1612 16.286 14.321 16.286C16.8795 16.286 19.1057 17.2133 20.2022 19.5978C20.5345 20.2933 20.7006 21.0551 20.7006 21.7837C20.7006 25.9898 16.3478 27.8113 12.6596 27.8113C9.80204 27.8113 7.74196 26.7184 5.91445 24.7975C5.18346 25.6255 4.68507 26.8509 4.68507 27.9107C4.68507 31.355 8.00779 32.5142 11.3637 32.5142C14.6865 32.5142 18.0092 31.5206 20.4016 29.3348L20.7006 29.0367C23.4585 31.885 23.6579 32.0836 23.824 32.2493Z"
                                    fill="#4EBDDB" />
                            </svg>
                        </a>

                        <div className="header__actions">
                            <a href="/login" onClick={handleLogin} className="btn btn-text btn--with-icon">
                                Iniciar sesión
                                <svg className="btn__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 11V8L15 12L10 16V13H1V11H10ZM2.4578 15H4.58152C5.76829 17.9318 8.64262 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9H2.4578C3.73207 4.94289 7.52236 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C7.52236 22 3.73207 19.0571 2.4578 15Z" />
                                </svg>
                            </a>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="main">
                <section className="hero">
                    <div className="container">
                        <div className="hero__grid">
                            <div className="hero__content">
                                <div className="hero__badge">
                                    <span className="hero__badge-icon">●</span>
                                    <span className="hero__badge-text">+7.000 estudiantes activos</span>
                                </div>

                                <h1 className="hero__title">
                                    Aprueba el <span className="hero__title-highlight">Eunacom</span> con el único método garantizado
                                </h1>

                                <p className="hero__subtitle">
                                    <b>98% de nuestros estudiantes</b> aprueban el examen y logran ingresar a la especialidad deseada.
                                </p>

                                <div className="hero__text">
                                    <p>Deja de memorizar...</p>
                                    <p className="hero__text-highlight">
                                        Entiende, practica y llega confiado al Eunacom
                                    </p>
                                </div>

                                <div className="hero__actions">
                                    <a href="https://mieunacom.cl/registro" className="btn btn-cta-secondary btn-lg">Comienza aquí</a>
                                    <a href="#references" className="btn btn-outline btn-lg">Ver casos de éxito</a>
                                </div>
                            </div>

                            <div className="hero__visual">
                                <div className="hero__visual--container">
                                    <div className="hero__card hero__card--1 scroll-fade-in scroll-stagger-1">
                                        <img src="https://mieunacom.cl/web/welcome_page_assets/img/profile-hero-1.webp" alt="foto de perfil estudiantes" className="hero__card--img" />
                                        <div className="hero__card--info">
                                            <p className="hero__card--name">José Reyes</p>
                                            <p className="hero__card--description">Aprobó Eunacom 2025</p>
                                        </div>
                                    </div>
                                    <div className="hero__card hero__card--2 scroll-fade-in scroll-stagger-2">
                                        <img src="https://mieunacom.cl/web/welcome_page_assets/img/profile-hero-2.webp" alt="foto de perfil estudiantes" className="hero__card--img" />
                                        <div className="hero__card--info">
                                            <p className="hero__card--name">Beatriz Campos</p>
                                            <p className="hero__card--description">Aprobó Eunacom 2025</p>
                                        </div>
                                    </div>
                                    <div className="hero__card hero__card--3 scroll-fade-in scroll-stagger-3">
                                        <img src="https://mieunacom.cl/web/welcome_page_assets/img/profile-hero-3.webp" alt="foto de perfil estudiantes" className="hero__card--img" />
                                        <div className="hero__card--info">
                                            <p className="hero__card--name">Charlotte Sotelo</p>
                                            <p className="hero__card--description">Aprobó Eunacom 2025</p>
                                        </div>
                                    </div>
                                    <img src="https://mieunacom.cl/web/welcome_page_assets/img/hero-photo.webp" alt="Imagen de médicos y testimoniales" className="hero__image" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features" id="features">
                    <div className="container">
                        <div className="section-header scroll-fade-in">
                            <h2 className="section-header__title">
                                Todo lo que necesitas para <span className="section-header__title-highlight">aprobar el Eunacom</span>
                            </h2>
                            <p className="section-header__subtitle">
                                Una plataforma creada para médicos que buscan la excelencia
                            </p>
                        </div>

                        <div className="features__grid">
                            {[
                                { img: "features_1.webp", title: "Más de 10.000 preguntas explicadas", desc: "Comprende el razonamiento detrás de respuesta." },
                                { img: "features_2.webp", title: "Reconstrucciones reales", desc: "Practica bajo condiciones iguales al examen" },
                                { img: "features_3.webp", title: "Recursos y material de estudio", desc: "Flashcards, ebooks, videos, juegos y mucho más." },
                                { img: "features_4.webp", title: "Masterclass con especialistas", desc: "Clases en vivo todas las semanas" }
                            ].map((feature, i) => (
                                <div key={i} className="features__card scroll-fade-in scroll-stagger-1">
                                    <div className="features__card-image">
                                        <div className="features__card-placeholder">
                                            <img src={`https://mieunacom.cl/web/welcome_page_assets/img/${feature.img}`} alt={feature.title} className="features__card-img" />
                                        </div>
                                    </div>
                                    <div className="features__card-content">
                                        <h3 className="features__card-title">{feature.title}</h3>
                                        <p className="features__card-description">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Success Cases Section */}
                <section className="section section--light">
                    <div className="container">
                        <div className="section-header section-header--center scroll-fade-in">
                            <h2 className="section-header__title">
                                Casos de éxito en el <span className="section-header__title-highlight">Eunacom</span>
                            </h2>
                            <p className="section-header__subtitle">
                                Resultados reales de médicos que confiaron en nosotros
                            </p>
                        </div>

                        <div className="success-grid">
                            {[
                                { name: "Nicolás Sapunar", score: "99.5 puntos", img: "profile-hero-2.webp" },
                                { name: "Claudio Carrasco", score: "97.1 puntos", img: "profile-hero-1.webp" },
                                { name: "Alejandro Díaz", score: "95.1 puntos", img: "profile-hero-3.webp" }, // Using varied images
                                { name: "Joaquín Abelli", score: "87 puntos", img: "profile-hero-1.webp" },
                                { name: "Constanza Acevedo", score: "+85 puntos", img: "profile-hero-2.webp" }
                            ].map((student, i) => (
                                <div key={i} className="success-card scroll-fade-in scroll-stagger-1">
                                    <div className="success-card__image-wrapper">
                                        <img
                                            src={`https://mieunacom.cl/web/welcome_page_assets/img/${student.img}`}
                                            alt={student.name}
                                            className="success-card__image"
                                        />
                                    </div>
                                    <div className="success-card__content">
                                        <h3 className="success-card__name">{student.name}</h3>
                                        <div className="success-card__score">
                                            <span className="success-card__score-label">Puntaje Eunacom</span>
                                            <span className="success-card__score-value">{student.score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="section section--dark" id="references">
                    <div className="container">
                        <div className="section-header section-header--center scroll-fade-in">
                            <h2 className="section-header__title">
                                Historias reales, <span className="section-header__title-highlight">resultados reales</span>
                            </h2>
                        </div>

                        <div className="testimonials-grid">
                            {[
                                {
                                    name: "Tomás V.",
                                    detail: "Eunacom 2025",
                                    text: "Lo que más me gustó fue cómo la plataforma organizó mi estudio. Los temas que solía pasar por alto estaban ahí, explicados de forma que no podía ignorarlos."
                                },
                                {
                                    name: "Tania G.",
                                    detail: "Eunacom 2025",
                                    text: "Las explicaciones detalladas son oro. No solo te dicen cuál es la correcta, sino por qué las otras no lo son. Eso me ayudó a razonar mejor en el examen real."
                                },
                                {
                                    name: "Mariela A.",
                                    detail: "Eunacom 2025",
                                    text: "Hice muchos ensayos, pero ninguno se sentía como el real hasta que probé esta plataforma. La ansiedad bajó muchísimo cuando vi que el formato era el mismo."
                                }
                            ].map((testimonial, i) => (
                                <div key={i} className="testimonial-card scroll-fade-in scroll-stagger-1">
                                    <div className="testimonial-card__quote">"</div>
                                    <p className="testimonial-card__text">{testimonial.text}</p>
                                    <div className="testimonial-card__author">
                                        <div className="testimonial-card__avatar">
                                            {testimonial.name[0]}
                                        </div>
                                        <div className="testimonial-card__info">
                                            <span className="testimonial-card__name">{testimonial.name}</span>
                                            <span className="testimonial-card__detail">{testimonial.detail}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="section">
                    <div className="container">
                        <div className="section-header section-header--center scroll-fade-in">
                            <h2 className="section-header__title">
                                Cómo funciona <span className="section-header__title-highlight">Mi Eunacom</span>
                            </h2>
                        </div>

                        <div className="steps-grid">
                            {[
                                {
                                    step: "01",
                                    title: "Regístrate",
                                    desc: "Crea tu cuenta en menos de 60 segundos y accede a la plataforma inmediatamente."
                                },
                                {
                                    step: "02",
                                    title: "Comienza tu estudio",
                                    desc: "Responde preguntas, realiza ensayos y utiliza el material de estudio disponible."
                                },
                                {
                                    step: "03",
                                    title: "Mejora con análisis",
                                    desc: "Revisa tu rendimiento detallado para identificar tus áreas de mejora y aumentar tu puntaje."
                                }
                            ].map((item, i) => (
                                <div key={i} className="step-card scroll-fade-in scroll-stagger-1">
                                    <div className="step-card__number">{item.step}</div>
                                    <h3 className="step-card__title">{item.title}</h3>
                                    <p className="step-card__description">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Methodology & Media Stub */}
                <section className="section section--light">
                    <div className="container">
                        <div className="methodology-wrapper scroll-fade-in">
                            <div className="methodology-content">
                                <h2 className="section-header__title">
                                    Metodología respaldada por la <span className="section-header__title-highlight">ciencia del aprendizaje</span>
                                </h2>
                                <p>
                                    Utilizamos técnicas de <b>Repetición Espaciada</b> y <b>Active Recall</b> para asegurar que retengas el conocimiento médico a largo plazo, no solo para el examen.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="faq" className="faq">
                    <div className="container">
                        <div className="section-header section-header--center scroll-fade-in">
                            <h2 className="section-header__title">
                                Preguntas <span className="section-header__title-highlight">Frecuentes</span>
                            </h2>
                        </div>
                        <div className="faq__grid">
                            <div className="faq__column">
                                <FAQItem
                                    question="¿Qué es Mi Eunacom y cómo puede ayudarme?"
                                    answer="Mi Eunacom es una plataforma web diseñada para ayudarte a preparar de manera efectiva para el examen Eunacom, ofreciendo más de 10 mil preguntas preguntas, justificaciones detalladas de cada respuesta y simulaciones idénticas al examen y en tiempo real."
                                    isOpen={openFAQ === 0}
                                    onClick={() => toggleFAQ(0)}
                                />
                                <FAQItem
                                    question="¿Qué incluye la plataforma?"
                                    answer="La plataforma incluye más de 5 mil preguntas únicas, justificaciones detalladas para cada respuesta, simulaciones del examen en tiempo real, análisis personalizado de desempeño y una interfaz intuitiva accesible desde cualquier dispositivo."
                                    isOpen={openFAQ === 1}
                                    onClick={() => toggleFAQ(1)}
                                />
                                <FAQItem
                                    question="¿Cómo se aseguran de que las preguntas y el contenido están actualizados?"
                                    answer="Trabajamos con un equipo de médicos expertos que revisan y actualizan continuamente las preguntas y el contenido."
                                    isOpen={openFAQ === 2}
                                    onClick={() => toggleFAQ(2)}
                                />
                                <FAQItem
                                    question="¿Cuántas preguntas incluye Mi Eunacom y qué tan variadas son?"
                                    answer="Mi Eunacom incluye más de 5 mil preguntas únicas que cubren todas las especialidades del examen, además de todos los niveles de dificultad, garantizando así una preparación completa y exhaustiva."
                                    isOpen={openFAQ === 3}
                                    onClick={() => toggleFAQ(3)}
                                />
                                <FAQItem
                                    question="¿Cómo funcionan las justificaciones de las respuestas?"
                                    answer="Cada pregunta viene con una justificación detallada que explica por qué la respuesta es correcta, ayudándote a entender mejor los conceptos y aprender de tus errores."
                                    isOpen={openFAQ === 4}
                                    onClick={() => toggleFAQ(4)}
                                />
                            </div>
                            <div className="faq__column">
                                <FAQItem
                                    question="¿Qué son las simulaciones de examen en tiempo real y cómo me benefician?"
                                    answer="Las simulaciones de examen en tiempo real replican las condiciones del examen Eunacom, permitiéndote familiarizarte con el formato y la presión de tiempo, lo que te ayuda a reducir la ansiedad y mejorar tu desempeño."
                                    isOpen={openFAQ === 5}
                                    onClick={() => toggleFAQ(5)}
                                />
                                <FAQItem
                                    question="¿Cómo puedo utilizar el análisis de desempeño para mejorar mis estudios?"
                                    answer="El análisis personalizado de desempeño te muestra tus fortalezas y áreas de mejora, proporcionándote recomendaciones específicas para enfocar tu estudio de manera más efectiva y eficiente."
                                    isOpen={openFAQ === 6}
                                    onClick={() => toggleFAQ(6)}
                                />
                                <FAQItem
                                    question="¿La plataforma es accesible desde cualquier dispositivo?"
                                    answer="Sí, la plataforma es accesible desde cualquier dispositivo, incluyendo computador, tabletas y teléfonos móviles y tablets, para que puedas estudiar cuando y donde quieras."
                                    isOpen={openFAQ === 7}
                                    onClick={() => toggleFAQ(7)}
                                />
                                <FAQItem
                                    question="¿Qué opinan otros estudiantes que han usado Mi Eunacom?"
                                    answer="Nuestros usuarios han reportado una alta satisfacción con Mi Eunacom, destacando la calidad de las preguntas, la utilidad de las justificaciones detalladas y la efectividad de las simulaciones de examen en tiempo real."
                                    isOpen={openFAQ === 8}
                                    onClick={() => toggleFAQ(8)}
                                />
                                <FAQItem
                                    question="¿Cómo puedo contactarlos si tengo más preguntas o necesito ayuda?"
                                    answer={<span>Puedes contactarnos escribiéndonos al correo <a href="mailto:contacto@mieunacom.cl">contacto@mieunacom.cl</a>. Nuestro equipo de atención al cliente está siempre dispuesto a ayudarte.</span>}
                                    isOpen={openFAQ === 9}
                                    onClick={() => toggleFAQ(9)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer__bottom">
                        <div className="footer__copyright">
                            <span>© Todos Los Derechos Reservados - Mi Eunacom {new Date().getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
