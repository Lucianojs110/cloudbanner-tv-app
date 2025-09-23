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
    title: string; products: Product[]; customization: Customization;
    orientation?: "vertical" | "horizontal";
    rotationDirection?: "right" | "left";
}

export default function ProductList3({
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



    // 📌 VERTICAL (rotado, imagen izquierda y texto derecha)
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
                        paddingTop: innerHeight * 0.02
                    }}
                >
                    <Header
                        title={title}
                        boxColor={titleBoxColor}
                        textColor={productNameColor}
                        fontFamily={fontFamily}
                        style={{ marginLeft: 25 }}
                    />
                    <View style={{ flexDirection: "column", gap: 30, width: "90%" }}>
                        {products
                            .filter(p => p && p.name) // ✅ Evitar productos vacíos
                            .map((p, index) => {
                                const hasOffer = !!p.offer_price;
                                return (
                                    <View
                                        key={p.id || index} // ✅ Key única
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center"
                                        }}
                                    >
                                        {p.media?.[0]?.original_url && (
                                            <Image
                                                source={{ uri: p.media[0].original_url }}
                                                style={{
                                                    width: innerWidth * 0.4,
                                                    height: innerHeight * 0.25,
                                                    backgroundColor: "#f4f4f4",
                                                    marginRight: 16
                                                }}
                                                resizeMode="contain"
                                            />
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: innerWidth * 0.08,
                                                    fontWeight: "bold",
                                                    color: productTextColor,
                                                    backgroundColor: productTextBoxColor,
                                                    paddingHorizontal: 12,
                                                    marginBottom: 6,
                                                    textAlign: "center",
                                                    alignSelf: "flex-start"
                                                }}
                                            >
                                                {p.name}
                                            </Text>
                                            {p.description && (
                                                <Text style={{
                                                    color: descriptionColor,
                                                    fontSize: innerWidth * 0.04,
                                                    marginBottom: 4,
                                                    textAlign: "left"
                                                }}>
                                                    {p.description}
                                                </Text>
                                            )}
                                            <Text style={{
                                                fontSize: innerWidth * 0.08,
                                                color: priceTextColor,
                                                fontWeight: "bold",
                                                textAlign: "left"
                                            }}>
                                                ${parseFloat(hasOffer ? p.offer_price! : p.price).toLocaleString("es-AR")}
                                            </Text>
                                            {hasOffer && (
                                                <Text style={{
                                                    textDecorationLine: "line-through",
                                                    color: oldPriceColor,
                                                    fontSize: innerWidth * 0.03,
                                                    textAlign: "left"
                                                }}>
                                                    Antes: ${parseFloat(p.price).toLocaleString("es-AR")}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                    </View>
                    <Logo />
                </View>
            </Container>
        );
    }



    // 📌 HORIZONTAL
    return (
        <Container {...containerProps}>
            <Header
                title={title}
                boxColor={titleBoxColor}
                textColor={productNameColor}
                fontFamily={fontFamily}
            />
            <View style={styles.threeRow}>
                {products
                    .filter(p => p && p.name) // ✅ Evitar productos vacíos
                    .map((p, index) => (
                        <View key={p.id || index} style={styles.threeItem}>
                            {p.media?.[0]?.original_url &&
                                <Image source={{ uri: p.media[0].original_url }} style={styles.threeImg} resizeMode="contain" />
                            }
                            <Text style={{
                                color: productTextColor,
                                backgroundColor: productTextBoxColor,
                                fontWeight: "bold",
                                fontSize: 24,
                                fontFamily,
                                paddingHorizontal: 16,
                                marginTop: 10,
                                alignSelf: "center",
                                textAlign: "center",
                                marginBottom: 6,
                            }}>
                                {p.name}
                            </Text>
                            {p.description &&
                                <Text style={{
                                    color: descriptionColor,
                                    fontSize: 14,
                                    fontFamily,
                                    marginBottom: 8,
                                    marginTop: 2,
                                    textAlign: "center",
                                }}>
                                    {p.description}
                                </Text>
                            }
                            <Text style={{
                                color: priceTextColor,
                                fontSize: 19,
                                fontFamily,
                                fontWeight: "bold",
                                marginBottom: 2,
                                textAlign: "center",
                            }}>
                                ${parseFloat(p.offer_price || p.price).toLocaleString("es-AR")}
                            </Text>
                            {p.offer_price && (
                                <Text style={{
                                    textDecorationLine: "line-through",
                                    color: oldPriceColor,
                                    fontSize: 13,
                                    fontFamily,
                                    marginBottom: 0,
                                    textAlign: "center"
                                }}>
                                    Antes: ${parseFloat(p.price).toLocaleString("es-AR")}
                                </Text>
                            )}
                        </View>
                    ))}
            </View>
            <Logo />
        </Container>
    );

}

// COMPONENTES AUXILIARES
function Header({ title, boxColor, textColor, fontFamily, style = {} }: any) {
    return (
        <View style={[styles.label, { backgroundColor: boxColor }, style]}>
            <Text style={{ color: textColor, fontSize: 21, fontWeight: "700", fontFamily }}>
                {title}
            </Text>
        </View>
    );
}


function Logo() {
    return (
        <Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Logo_La_Hacienda.png" }}
            style={{ width: 60, height: 60, position: "absolute", bottom: 24, alignSelf: "center" }}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, paddingHorizontal: 40, paddingTop: 32, backgroundColor: "#fff", position: "relative",
    },
    label: {
        alignSelf: "flex-start", paddingHorizontal: 22, paddingVertical: 7, marginBottom: 24, marginTop: 3,
    },
    threeRow: {
        flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 28, marginTop: 12,
    },
    threeImg: {
        width: 240,
        height: 170,
        marginBottom: 12,
        marginTop: 3,
        backgroundColor: "#f4f4f4",
        resizeMode: "contain"
    },
    threeItem: {
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 24,
        width: 270,
        maxWidth: 320,
    },
});
