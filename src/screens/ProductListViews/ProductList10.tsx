import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
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

export default function ProductList10({
    title,
    products,
    customization,
    orientation = "vertical",
    rotationDirection = "right",
}: Props) {
    const screen = Dimensions.get("window");
    const isVertical = orientation === "vertical";

    const containerWidth = screen.width;
    const containerHeight = screen.height;

    // Colores y fuentes
    const bgType = customization.background_type || "box";
    const priceTextColor = customization.price_text_color || "#0162E8";
    const fontFamily = customization.font_family || "System";
    const titleBoxColor = customization.list_text_box_color || "#0162E8";
    const productNameColor = customization.list_text_color || "#000";
    const productTextBoxColor = customization.product_text_box_color || "#fff";
    const productTextColor = customization.product_text_color || "#000";
    const descriptionColor = customization.other_texts || "#47c7be";
    const oldPriceColor = customization.other_texts || "#47c7be"
    const backgroundColor = customization.primary_color || "#e3edf7";

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
        const secondary = customization.secondary_color || "#000000";
        containerProps.colors = [backgroundColor, secondary];
        containerProps.start = { x: 0, y: 0 };
        containerProps.end = { x: 1, y: 1 };
    }

    if (bgType === "image" && customization.media?.[0]?.original_url) {
        const { ImageBackground } = require("react-native");
        Container = ImageBackground;
        containerProps.source = { uri: customization.media[0].original_url };
        containerProps.resizeMode = "cover";
    }

    // VERTICAL: 1 columna (10 filas, scroll)
    if (isVertical) {
        const innerWidth = containerHeight;
        const innerHeight = containerWidth;
        const rotateDeg = (rotationDirection === "right" ? "90deg" : "-90deg");
        const rowHeight = innerHeight / 15.2;
        const fontName = Math.max(innerWidth * 0.040, 14);
        const fontPrice = Math.max(innerWidth * 0.045, 13);
        const fontOld = Math.max(innerWidth * 0.025, 10);

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
                    <Header
                        title={title}
                        boxColor={titleBoxColor}
                        textColor={productNameColor}
                        fontFamily={fontFamily}
                        orientation={orientation}
                        style={{ marginTop: 30 }}
                    />
                    <ScrollView
                        style={{ width: "100%" }}
                        contentContainerStyle={{
                            marginTop: 4,
                            width: "100%",
                            gap: 5,
                            paddingBottom: 30,
                        }}
                    >
                        {products
                            .filter(p => p && p.name) // ✅ Evitar vacíos
                            .map((p, index) => (
                                <View
                                    key={p.id || index}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: productTextBoxColor,
                                        paddingVertical: rowHeight * 0.10,
                                        paddingHorizontal: innerWidth * 0.018,
                                        minHeight: rowHeight,
                                        marginBottom: 3,
                                        width: "85%",
                                        alignSelf: "center",
                                        elevation: 3,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                                        <Text
                                            style={{
                                                fontWeight: "bold",
                                                fontSize: fontName,
                                                color: productTextColor,
                                                fontFamily,
                                            }}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {p.name}
                                        </Text>
                                        {p.description && (
                                            <Text
                                                style={{
                                                    fontSize: fontName * 0.6,
                                                    color: descriptionColor,
                                                    marginLeft: 4,
                                                }}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                            >
                                                {p.description}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        {p.offer_price && (
                                            <Text
                                                style={{
                                                    textDecorationLine: "line-through",
                                                    color: oldPriceColor,
                                                    fontSize: fontOld,
                                                    fontFamily,
                                                    marginRight: innerWidth * 0.012,
                                                }}
                                            >
                                                ${parseFloat(p.price).toLocaleString("es-AR")}
                                            </Text>
                                        )}
                                        <Text
                                            style={{
                                                color: priceTextColor,
                                                fontWeight: "bold",
                                                fontSize: fontPrice,
                                                fontFamily,
                                            }}
                                        >
                                            ${parseFloat(p.offer_price || p.price).toLocaleString("es-AR")}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                    </ScrollView>
                    <Logo />
                </View>
            </Container>
        );
    }

    // HORIZONTAL: 2 columnas x 5 filas
    const numColumns = 2;
    const column1 = products.filter(p => p && p.name).slice(0, 5); // ✅ Filtrado
    const column2 = products.filter(p => p && p.name).slice(5, 10); // ✅ Filtrado

    const cellWidth = containerWidth / numColumns * 0.94;
    const cellHeight = containerHeight / 5 * 0.55;
    const fontName = Math.max(cellHeight * 0.45, 14);
    const fontPrice = Math.max(cellHeight * 0.4, 13);
    const fontOld = Math.max(cellHeight * 0.25, 10);

    return (
        <Container {...containerProps}>
            <View style={{ width: containerWidth, height: containerHeight, alignItems: "center" }}>
                <Header
                    title={title}
                    boxColor={titleBoxColor}
                    textColor={productNameColor}
                    fontFamily={fontFamily}
                    orientation={orientation}
                    style={{ marginTop: 20, marginLeft: 20 }}
                />
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 20,
                    }}
                >
                    {[column1, column2].map((column, colIdx) => (
                        <View key={colIdx} style={{ flex: 1, gap: 6 }}>
                            {column.map((p, index) => (
                                <View
                                    key={p.id || `${colIdx}-${index}`}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: productTextBoxColor,
                                        paddingVertical: cellHeight * 0.11,
                                        paddingHorizontal: cellWidth * 0.05,
                                        minHeight: cellHeight,
                                        marginBottom: 5,
                                        marginHorizontal: 5,
                                        width: "98%",
                                        alignSelf: "center",
                                        elevation: 3,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                        <Text
                                            style={{
                                                fontWeight: "bold",
                                                fontSize: fontName,
                                                color: productTextColor,
                                                fontFamily,
                                            }}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {p.name}
                                        </Text>
                                        {p.description && (
                                            <Text
                                                style={{
                                                    fontSize: fontName * 0.6,
                                                    color: descriptionColor,
                                                    marginLeft: 4,
                                                }}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                            >
                                                {p.description}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        {p.offer_price && (
                                            <Text
                                                style={{
                                                    textDecorationLine: "line-through",
                                                    color: oldPriceColor,
                                                    fontSize: fontOld,
                                                    fontFamily,
                                                    marginRight: cellWidth * 0.04,
                                                }}
                                            >
                                                ${parseFloat(p.price).toLocaleString("es-AR")}
                                            </Text>
                                        )}
                                        <Text
                                            style={{
                                                color: priceTextColor,
                                                fontWeight: "bold",
                                                fontSize: fontPrice,
                                                fontFamily,
                                            }}
                                        >
                                            ${parseFloat(p.offer_price || p.price).toLocaleString("es-AR")}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
                <Logo />
            </View>
        </Container>
    );


}

function Header({ title, boxColor, textColor, fontFamily, orientation, style = {} }: any) {
    return (
        <View style={[
            styles.label,
            { backgroundColor: boxColor, alignSelf: orientation === "vertical" ? "center" : "flex-start" },
            style,
        ]}>
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
        paddingHorizontal: 30,
        paddingTop: 32,
        backgroundColor: "#fff",
        position: "relative",
    },
    label: {
        paddingHorizontal: 15,
        paddingVertical: 7,
        marginBottom: 24,
        marginTop: 3,
    },
});
