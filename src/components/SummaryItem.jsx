import Image from 'next/image';
import { useLiveStock, useLiveVisibility, useLivePrice, useLiveSalePrice } from '../../context/RealtimeStockContext';
import { getSalePricing } from '../../utils/price';
import styles from './checkout.module.css';

export default function SummaryItem({ item }) {
  const product = item.product;
  // Live data hooks
  const liveStock = useLiveStock(product._id || product.id, product.stock);
  const liveVisibility = useLiveVisibility(product._id || product.id, product.inStock !== undefined ? product.inStock : true);
  const effectiveLiveStock = liveVisibility === false ? 0 : liveStock;
  const livePrice = useLivePrice(product._id || product.id, product.price);
  const liveSalePrice = useLiveSalePrice(product._id || product.id, product.salePrice);
  const { isSaleValid: liveSaleValid, originalPriceStr, salePriceStr } = getSalePricing({ ...product, price: livePrice, salePrice: liveSalePrice });

  const variant = item.color ? product.variants?.find(v => v.colorName === item.color) : null;
  const itemImage = variant?.images?.length > 0 ? variant.images[0] : (product.img || '/placeholder.png');

  return (
    <div className={styles.summaryItem}>
      <div className={styles.productImageWrapper}>
        <div className={styles.productImageContainer}>
          <Image src={itemImage} alt={product.name} fill style={{ objectFit: 'cover' }} />
        </div>
        <span className={styles.quantityBadge}>{item.quantity}</span>
        {/* Badges - only show at checkout */}
        {effectiveLiveStock > 0 && (product.isNew || (product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000)) && (
          <div className={styles.statusBadge}>New Arrival</div>
        )}
        {liveSaleValid && effectiveLiveStock > 0 && (
          <div className="premiumSaleBadge">SALE</div>
        )}
        {effectiveLiveStock === 0 && (
          <div className={styles.premiumOutOfStockBadge}>Out of Stock</div>
        )}
        {effectiveLiveStock > 0 && effectiveLiveStock <= 20 && (
          <div className={styles.premiumLowStockBadge}>Only {effectiveLiveStock} left</div>
        )}
      </div>
      <div className={styles.itemInfo}>
        <h4 className={styles.itemName}>{product.name}</h4>
        <p className={styles.itemMeta}>Size: {item.size}</p>
      </div>
      <div className={styles.itemPrice}>
        {liveSaleValid ? (
          <div className="premiumPriceContainer" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
            <span className="premiumOriginalPrice" style={{ fontSize: '0.8em' }}>₹{(parseFloat((product.originalPrice || "0").toString().replace(/[^0-9.]/g, "")) * item.quantity).toLocaleString('en-IN')}</span>
            <span className="premiumSalePrice" style={{ fontSize: '1em' }}>₹{(parseFloat((product.price || "0").toString().replace(/[^0-9.]/g, "")) * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ) : (
          `₹${(parseFloat((product.price || "0").toString().replace(/[^0-9.]/g, "")) * item.quantity).toLocaleString('en-IN')}`
        )}
      </div>
    </div>
  );
}
