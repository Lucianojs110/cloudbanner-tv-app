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

export default function ProductList4({
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



    // 📌 VERTICAL
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
                        paddingTop: innerHeight * 0.01
                    }}
                >
                    <Header
                        title={title}
                        boxColor={titleBoxColor}
                        textColor={productNameColor}
                        fontFamily={fontFamily}
                        style={{ marginLeft: 25 }}
                    />
                    <View style={{ flexDirection: "column", gap: 20, width: "90%" }}>
                        {products
                            .filter(p => p && p.name) // ✅ Evitar productos vacíos
                            .map((p, index) => {
                                const hasOffer = !!p.offer_price;
                                return (
                                    <View key={p.id || index} style={{ flexDirection: "row", alignItems: "center" }}>
                                        {p.media?.[0]?.original_url && (
                                            <Image
                                                source={{ uri: p.media[0].original_url }}
                                                style={{
                                                    width: innerWidth * 0.4,
                                                    height: innerHeight * 0.2,
                                                    marginRight: 14
                                                }}
                                                resizeMode="cover"
                                            />
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: innerWidth * 0.08,
                                                    fontWeight: "bold",
                                                    color: productTextColor,
                                                    backgroundColor: productTextBoxColor,
                                                    paddingHorizontal: 10,
                                                    marginBottom: 6,
                                                    alignSelf: "flex-start",
                                                }}
                                            >
                                                {p.name}
                                            </Text>
                                            {p.description && (
                                                <Text style={{
                                                    color: descriptionColor,
                                                    fontSize: innerWidth * 0.04,
                                                    marginBottom: 4
                                                }}>
                                                    {p.description}
                                                </Text>
                                            )}
                                            <Text style={{
                                                fontSize: innerWidth * 0.06,
                                                color: priceTextColor,
                                                fontWeight: "bold"
                                            }}>
                                                ${parseFloat(hasOffer ? p.offer_price! : p.price).toLocaleString("es-AR")}
                                            </Text>
                                            {hasOffer && (
                                                <Text style={{
                                                    textDecorationLine: "line-through",
                                                    color: oldPriceColor,
                                                    fontSize: innerWidth * 0.03
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

    // 📌 HORIZONTAL (igual que ahora)
    return (
        <Container {...containerProps}>
            <Header
                title={title}
                boxColor={titleBoxColor}
                textColor={productNameColor}
                fontFamily={fontFamily}
            />
            <View style={styles.fourGrid}>
                {products
                    .filter(p => p && p.name) // ✅ Evitar productos vacíos
                    .map((p, index) => (
                        <View key={p.id || index} style={styles.fourCell}>
                            {p.media?.[0]?.original_url && (
                                <Image
                                    source={{ uri: p.media[0].original_url }}
                                    style={styles.fourImg}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.fourInfoBox}>
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    color: productTextColor,
                                    backgroundColor: productTextBoxColor,
                                    paddingHorizontal: 10,
                                    marginBottom: 6
                                }}>
                                    {p.name}
                                </Text>
                                {p.description && (
                                    <Text style={{
                                        color: descriptionColor,
                                        fontSize: 14,
                                        marginBottom: 6
                                    }}>
                                        {p.description}
                                    </Text>
                                )}
                                <Text style={{
                                    fontSize: 18,
                                    color: priceTextColor,
                                    fontWeight: "bold"
                                }}>
                                    ${parseFloat(p.offer_price || p.price).toLocaleString("es-AR")}
                                </Text>
                                {p.offer_price && (
                                    <Text style={{
                                        textDecorationLine: "line-through",
                                        color: oldPriceColor,
                                        fontSize: 13
                                    }}>
                                        Antes: ${parseFloat(p.price).toLocaleString("es-AR")}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
            </View>
            <Logo />
        </Container>
    );



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
            <Image
                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Logo_La_Hacienda.png" }}
                style={{ width: 60, height: 60, position: "absolute", bottom: 24, alignSelf: "center" }}
                resizeMode="contain"
            />
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 40,
        paddingTop: 10,
        backgroundColor: "#fff",
        position: "relative",
    },
    label: {
        alignSelf: "flex-start",
        paddingHorizontal: 22,
        paddingVertical: 7,
        marginBottom: 24,
        marginTop: 3,
    },
    fourGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        marginTop: 0,
        width: "100%",
    },
    fourCell: {
        flexDirection: "row",
        alignItems: "center",
        width: "46%",
        margin: "2%",
        minWidth: 240,
        maxWidth: 340,
    },
    fourImg: {
        width: 190,
        height: 150,
        marginRight: 10,
        backgroundColor: "#f4f4f4",
    },
    fourInfoBox: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
    },
});
