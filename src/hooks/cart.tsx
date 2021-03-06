import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    if (!products.length) {
      loadProducts();
    }
  }, [products.length]);

  // useEffect(() => {
  //   let newProducts = [...products];
  //   if (newProducts.some(x => x.quantity === 0)) {
  //     newProducts = newProducts.filter(x => x.quantity > 0);
  //     setProducts(newProducts);
  //   }

  //   AsyncStorage.setItem(
  //     '@GoMarketPlace:products',
  //     JSON.stringify(newProducts),
  //   );
  // }, [products]);

  const addToCart = useCallback(
    async (product: Product) => {
      const newProducts = products.some(x => x.id === product.id)
        ? products.map(currentProduct => {
            if (currentProduct.id === product.id) {
              currentProduct.quantity += 1;
            }
            return currentProduct;
          })
        : [...products, { ...product, quantity: 1 }];

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);

      // setProducts(currentProducts => {
      //   if (currentProducts.some(x => x.id === product.id)) {
      //     const newProducts = currentProducts.map(currentProduct => {
      //       if (currentProduct.id === product.id) {
      //         currentProduct.quantity += 1;
      //       }
      //       return currentProduct;
      //     });
      //     return newProducts;
      //   }
      //   return [...currentProducts, { ...product, quantity: 1 }];
      // });
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(currentProduct => {
        if (currentProduct.id === id) {
          currentProduct.quantity += 1;
        }
        return currentProduct;
      });

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);
      // setProducts(currentProducts =>
      //   currentProducts.map(currentProduct => {
      //     if (currentProduct.id === id) {
      //       currentProduct.quantity += 1;
      //     }
      //     return currentProduct;
      //   }),
      // );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(currentProduct => {
        if (currentProduct.id === id && currentProduct.quantity) {
          currentProduct.quantity -= 1;
        }
        return currentProduct;
      });

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);
      // setProducts(currentProducts =>
      //   currentProducts.map(currentProduct => {
      //     if (currentProduct.id === id && currentProduct.quantity) {
      //       currentProduct.quantity -= 1;
      //     }
      //     return currentProduct;
      //   }),
      // );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
