import styles from './PageHero.module.css';

export default function PageHero({ title, subtitle, image }) {
  return (
    <section className={`${styles.hero} ${image ? styles.withImage : ''}`} style={image ? { backgroundImage: `url(${image})` } : {}}>
      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
