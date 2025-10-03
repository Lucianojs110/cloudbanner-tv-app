import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface Media { original_url: string }
interface Product {
    id: number; name: string; description?: string | null;
    price: string; offer_price?: string | null; media?: Media[];
}
interface Customization {
    primary_color?: string; secondary_color?: string;
    background_type?: "box" | "fade" | "image";
    font_family?: string; product_text_color?: string;
    price_text_color?: string; list_text_color?: string;
    list_text_box_color?: string; product_text_box_color?: string;
    other_texts?: string;
}
interface Props {
    title: string;
    products: Product[];
    customization: Customization;
    orientation?: "vertical" | "horizontal";
    rotationDirection?: "right" | "left";
}

export default function ProductList1({
    title,
    products,
    customization,
    orientation = "horizontal",
    rotationDirection = "right",
}: Props) {
    const screen = Dimensions.get("window");
    const isVertical = orientation === "vertical";

    const containerWidth = screen.width;
    const containerHeight = screen.height;


    const secondary = customization.secondary_color || "#000000";

    const backgroundColor = customization.primary_color || "#e3edf7";
    const bgType = customization.background_type || "box";
    const priceTextColor = customization.price_text_color || "#0162E8";
    const fontFamily = customization.font_family || "System";
    const titleBoxColor = customization.list_text_box_color || "#0162E8";
    const productNameColor = customization.list_text_color || "#000";
    const productTextBoxColor = customization.product_text_box_color || "#fff";
    const productTextColor = customization.product_text_color || "#000";
    const descriptionColor = customization.other_texts || "#47c7be";
    const oldPriceColor = customization.other_texts || "#47c7be"
    const p = products?.[0];


    let Container: any = View;


    let containerProps: any = {
        style: [
            styles.container,
            { width: containerWidth, height: containerHeight, justifyContent: "center", alignItems: "center" }
        ]
    };

    if (bgType === "box") {
        containerProps.style.push({ backgroundColor });
    }

    if (bgType === "fade") {
        Container = LinearGradient;
        const secondary = customization.secondary_color || "#000000"; // fallback
        containerProps.colors = [backgroundColor, secondary];
        containerProps.start = { x: 0, y: 0 };
        containerProps.end = { x: 1, y: 1 };
    }

    // Fondo tipo IMAGEN
    if (bgType === "image" && customization.media?.[0]?.original_url) {
        const { ImageBackground } = require("react-native");
        Container = ImageBackground;
        containerProps.source = { uri: customization.media[0].original_url };
        containerProps.resizeMode = "cover";
    }


    // Layout VERTICAL 
    if (isVertical) {
        const innerWidth = containerHeight;
        const innerHeight = containerWidth;
        const rotateDeg = rotationDirection === "right" ? "90deg" : "-90deg";

        return (
            <Container {...containerProps}>
                <View
                    style={{
                        width: innerWidth,
                        height: innerHeight,
                        transform: [{ rotate: rotateDeg }],
                        justifyContent: "flex-start",
                        alignItems: "center",

                    }}
                >
                    {p?.media?.[0]?.original_url && (
                        <Image
                            source={{ uri: p.media[0].original_url }}
                            style={{
                                width: innerWidth,
                                height: innerHeight * 0.5,
                                backgroundColor: "#f4f4f4",

                            }}
                            resizeMode="cover"
                        />
                    )}


                    {/* Nombre del producto */}
                    <Text style={{
                        fontSize: innerWidth * 0.1,
                        fontWeight: "bold",
                        color: productTextColor,
                        backgroundColor: productTextBoxColor,
                        paddingHorizontal: 20,
                        marginBottom: 10,
                        textAlign: "center",
                        width: innerWidth * 0.8,
                        marginVertical: 20,
                    }}>
                        {p.name}
                    </Text>

                    {/* Título debajo del nombre */}
                    <View style={{
                        backgroundColor: titleBoxColor,

                        paddingHorizontal: 22,
                        paddingVertical: 7,
                        marginBottom: 10,
                        alignItems: "center",
                        width: innerWidth * 0.8
                    }}>
                        <Text style={{
                            color: productNameColor,
                            fontSize: innerWidth * 0.05,
                            fontWeight: "700",
                            fontFamily: fontFamily,
                            textAlign: "center"
                        }}>
                            {title}
                        </Text>
                    </View>

                    {p.description && (
                        <Text style={{
                            color: descriptionColor,
                            fontSize: innerWidth * 0.06,
                            marginBottom: 5
                        }}>
                            {p.description}
                        </Text>
                    )}
                    <Text style={{
                        fontSize: innerWidth * 0.1,
                        color: priceTextColor,
                        fontWeight: "bold"
                    }}>
                        ${parseFloat(p.offer_price || p.price).toLocaleString("es-AR")}
                    </Text>
                    {p.offer_price && (
                        <Text style={{
                            textDecorationLine: "line-through",
                            color: oldPriceColor,
                            fontSize: innerWidth * 0.06
                        }}>
                            Antes: ${parseFloat(p.price).toLocaleString("es-AR")}
                        </Text>
                    )}
                    <Logo />
                </View>
            </Container>
        );
    }


    // 📌 Layout HORIZONTAL (normal)
    return (
        <Container {...containerProps}>
            <View style={styles.singleWrapperBig}>
                {p.media?.[0]?.original_url && (
                    <Image
                        source={{ uri: p.media[0].original_url }}
                        style={styles.singleImgBig}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.singleInfoBoxBig}>
                    {/* 🔹 Título (arriba) con recuadro */}
                    <Text style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: productNameColor,
                        backgroundColor: titleBoxColor,
                        paddingHorizontal: 16,

                        marginBottom: 10,
                        textAlign: "left",
                        alignSelf: "flex-start"
                    }}>
                        {title}
                    </Text>

                    {/* 🔹 Nombre (debajo) con su recuadro */}
                    <Text style={{
                        fontSize: 48,
                        fontWeight: "bold",
                        color: productTextColor,
                        backgroundColor: productTextBoxColor,
                        paddingHorizontal: 20,
                        marginBottom: 18,
                        textAlign: "left",
                        alignSelf: "flex-start"
                    }}>
                        {p.name}
                    </Text>

                    {/* 🔹 Descripción */}
                    {p.description && (
                        <Text style={{
                            color: descriptionColor,
                            fontSize: 24,
                            marginBottom: 18,
                            textAlign: "left",
                            alignSelf: "flex-start"
                        }}>
                            {p.description}
                        </Text>
                    )}

                    {/* 🔹 Precio */}
                    <Text style={{
                        fontSize: 40,
                        color: priceTextColor,
                        fontWeight: "bold",
                        textAlign: "left",
                        alignSelf: "flex-start"
                    }}>
                        ${parseFloat(p.offer_price || p.price).toLocaleString("es-AR")}
                    </Text>

                    {/* 🔹 Precio tachado */}
                    {p.offer_price && (
                        <Text style={{
                            textDecorationLine: "line-through",
                            color: oldPriceColor,
                            fontSize: 30,
                            marginBottom: 12,
                            textAlign: "left",
                            alignSelf: "flex-start"
                        }}>
                            Antes: ${parseFloat(p.price).toLocaleString("es-AR")}
                        </Text>
                    )}
                </View>
            </View>
            <Logo />
        </Container>
    );

}

function Header({ title, boxColor, textColor, fontFamily }: any) {
    return (
        <View style={[styles.label, { backgroundColor: boxColor }]}>
            <Text style={{ color: textColor, fontSize: 21, fontWeight: "700", fontFamily }}>
                {title}
            </Text>
        </View>
    );
}

function Logo() {
    return (
        <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Logo_La_Hacienda.png" }}
            style={{ width: 60, height: 60, position: "absolute", bottom: 24, alignSelf: "center" }}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 40,
        paddingTop: 0,

        position: "relative",
    },
    label: {
        alignSelf: "flex-start",
        paddingHorizontal: 22,
        paddingVertical: 7,
        marginBottom: 24,
        marginTop: -30,
    },
    singleWrapperBig: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginHorizontal: 4,
        marginTop: 20,
    },
    singleImgBig: {
        width: 450,
        height: 380,
        marginRight: 46,
        marginLeft: 0,
        backgroundColor: "#f4f4f4",
    },
    singleInfoBoxBig: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: 0,
    },
});
