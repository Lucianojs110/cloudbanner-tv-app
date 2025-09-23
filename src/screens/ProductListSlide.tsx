import React, { useState, useEffect } from "react";

// IMPORTÁ TUS ARCHIVOS
import ProductList1 from "./ProductListViews/ProductList1";
import ProductList2 from "./ProductListViews/ProductList2";
import ProductList3 from "./ProductListViews/ProductList3";
import ProductList4 from "./ProductListViews/ProductList4";
import ProductList5 from "./ProductListViews/ProductList5";
import ProductList10 from "./ProductListViews/ProductList10";

interface Media { original_url: string }
interface Product {
    id: number; name: string; description?: string | null;
    price: string; offer_price?: string | null; media?: Media[];
}
interface Customization {
    primary_color?: string; secondary_color?: string;
    background_type?: "box" | "degradado" | "imagen";
    font_family?: string; product_text_color?: string;
    price_text_color?: string; list_text_color?: string;
    list_text_box_color?: string; product_text_box_color?: string;
    pagination?: number; page_seconds?: number; other_texts?: string;
}
interface Props {
    title: string;
    products: Product[];
    customization: Customization;
    orientation?: "vertical" | "horizontal";
    rotationDirection?: "right" | "left";
    width?: number;
    height?: number;
    onComplete: () => void; // 👈 Agregado para avisar cuando termina
}



export default function ProductListSlide({
    title,
    products,
    customization,
    orientation = "horizontal",
    rotationDirection = "right",
    width,
    height,
    onComplete
}: Props) {
    // Mantener la paginación configurada aunque haya menos productos
    const pagination = customization.pagination || 1;
    const pageSeconds = customization.page_seconds || 10;

    const totalPages = Math.ceil(products.length / pagination);
    const [page, setPage] = useState(0);

    useEffect(() => {
        setPage(0);
    }, [products.length]);

    useEffect(() => {
        if (products.length > pagination) {
            const timer = setInterval(() => {
                setPage(prev => {
                    const nextPage = prev + 1;
                    if (nextPage >= totalPages) {
                        clearInterval(timer);
                        onComplete();
                        return prev;
                    }
                    return nextPage;
                });
            }, pageSeconds * 1000);

            return () => clearInterval(timer);
        } else {
            const singleTimer = setTimeout(onComplete, pageSeconds * 1000);
            return () => clearTimeout(singleTimer);
        }
    }, [products.length, pagination, pageSeconds]);

    // 🔹 Productos para la página actual
    const startIndex = page * pagination;
    const pageProducts = products.slice(startIndex, startIndex + pagination);

    // 🔹 Completar slots vacíos
    const productsToShow = [
        ...pageProducts,
        ...Array(Math.max(0, pagination - pageProducts.length))
            .fill({ id: -1, name: "", price: "", media: [] })
    ];

    // 🔹 Blindaje
    if (!productsToShow || productsToShow.length === 0) {
        return null;
    }

    // Render según la paginación configurada
    switch (pagination) {
        case 1:
            return <ProductList1 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
        case 2:
            return <ProductList2 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
        case 3:
            return <ProductList3 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
        case 4:
            return <ProductList4 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
        case 5:
            return <ProductList5 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
        case 10:
            return <ProductList10 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
        default:
            return <ProductList1 {...{ title, products: productsToShow, customization, orientation, rotationDirection, width, height }} />;
    }
}
