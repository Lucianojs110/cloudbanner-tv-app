import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Pressable,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Video from "react-native-video";
import KeepAwake from 'react-native-keep-awake';
import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from "react-native";
import { BackHandler } from 'react-native';
import ProductListSlide from "./ProductListSlide";


interface Props {
  onBack: () => void;
}


type Slide =
  | { type: "Multimedia"; url: string; image_seconds: number }
  | {
    type: "ProductList";
    title: string;
    products: any[];
    customization: any;
    duration: number;
  };

export default function SlidesScreen({ onBack }: Props) {
  KeepAwake.activate();

  const [urls, setUrls] = useState<Slide[]>([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<Video>(null);
  const [isMediaReady, setIsMediaReady] = useState(false);

  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [rotationDirection, setRotationDirection] = useState<"left" | "right">("right");
  const [cycleKey, setCycleKey] = useState(0);


  const [renderKey, setRenderKey] = useState(0);
  const checkingRef = useRef(false);
  const nextSlide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsMediaReady(false);
      if (urls.length === 1) {
        // 🔄 Forzar reinicio aunque sea el mismo slide
        setCycleKey((prev) => prev + 1);
      } else {
        setCurrentSlide((prev) => (prev + 1) % urls.length);
      }
    });
  };

  useEffect(() => {
    if (currentSlide >= urls.length) {
      setCurrentSlide(0); // Reseteamos al primer slide
    }
  }, [urls]);




  useEffect(() => {
    const checkUpdates = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const uuid = await AsyncStorage.getItem("@tv_uuid");
        if (!uuid) throw new Error("UUID no disponible.");

        // 🚫 siempre fetch fresco (con timestamp para evitar cache HTTP)
        const resp = await fetch(
          `https://panel.cloudbanner.io/api/tv/advertisements/${uuid}?t=${Date.now()}`
        );
        if (!resp.ok) throw new Error("Error al obtener anuncios.");

        // 👉 siempre bajar los anuncios, no usar AsyncStorage para cachear
        await fetchAdsAndDownload(setUrls, setLoading, setError);

        // reset de estado
        setCurrentSlide(0);
        setError(null);
        setIsMediaReady(false);
        setCycleKey(v => v + 1);
        setRenderKey(v => v + 1);

      } catch (err) {
        console.error("🚫 Error al chequear actualizaciones:", err);
        setError("No se pudo verificar actualizaciones.");
        setLoading(false);
      } finally {
        checkingRef.current = false;
      }
    };

    checkUpdates(); // al montar
    const interval = setInterval(checkUpdates, 60 * 1000); // cada minuto
    return () => clearInterval(interval);
  }, []);



  async function fetchAdsAndDownload(
    setUrls: (urls: Slide[]) => void,
    setLoading: (loading: boolean) => void,
    setError: (err: string | null) => void
  ) {
    try {
      const uuid = await AsyncStorage.getItem("@tv_uuid");
      if (!uuid) throw new Error("UUID no disponible.");

      const response = await fetch(
        `https://panel.cloudbanner.io/api/tv/advertisements/${uuid}`
      );
      if (!response.ok) throw new Error("Error al obtener anuncios del servidor.");

      const adsData = await response.json();

      setOrientation(adsData.orientation || "horizontal");
      setRotationDirection(adsData.rotation_direction || "right");


      const slides: Slide[] = [];

      // 🎞 Multimedia
      const multimediaAds = adsData.advertisements.filter(
        (ad: any) => ad.type === "Multimedia"
      );

      for (const ad of multimediaAds) {
        const mediaList = ad.data?.media || [];
        const duration = ad.data?.image_seconds || 5;

        for (const media of mediaList) {
          const remoteUrl = media.data;
          const ext = remoteUrl.includes(".mp4") ? "mp4" : "png";
          const filename = `media_${Date.now()}.${ext}`;

          let finalUrl = remoteUrl;

          if (Platform.OS !== "web") {
            const localPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
            const exists = await RNFS.exists(localPath);

            if (!exists) {
              console.log("⬇️ Descargando:", filename);
              const result = await RNFS.downloadFile({
                fromUrl: remoteUrl,
                toFile: localPath,
              }).promise;

              if (result.statusCode !== 200) {
                console.warn("❌ Falló la descarga:", filename);
                continue;
              }
            } else {
              console.log("📂 Ya existe:", filename);
            }

            finalUrl = `file://${localPath}`;
          }

          if (finalUrl) {
            console.log("✅ Media lista para mostrar:", finalUrl);
            slides.push({
              type: "Multimedia",
              url: finalUrl,
              image_seconds: duration,
            });
          } else {
            console.warn("⚠️ Media con URL inválida, se omitió.");
          }
        }
      }

      // 🛒 ProductList
      const productListAds = adsData.advertisements.filter(
        (ad: any) => ad.type === "ProductList"
      );

      for (const ad of productListAds) {
        slides.push({
          type: "ProductList",
          title: ad.title,
          products: ad.data?.products || [],
          customization: ad.data?.customization || {},
          duration: ad.data?.customization?.page_seconds || 10,
        });
      }

      if (slides.length === 0) {
        throw new Error("No se encontraron anuncios para mostrar.");
      }

      await AsyncStorage.setItem("@advertisements_urls", JSON.stringify(slides));
      //await AsyncStorage.setItem("@last_update", adsData.last_update);
      setUrls(slides);
    } catch (err: any) {
      console.error("❌ Error en fetchAdsAndDownload:", err.message || err);
      setError(err.message || "Error desconocido al cargar diapositivas.");
    } finally {
      setLoading(false);
    }
  }







  useEffect(() => {
    const backAction = () => {
      onBack(); // volvemos a IndexScreen
      return true; // evitamos que cierre la app
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);





  //useEffect(() => {
  //  fetchAdsAndDownload(setUrls, setLoading, setError);
  //}, []);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.fullText}>Cargando diapositivas...</Text>
      </View>
    );
  }

  if (error || urls.length === 0) {
    return (
      <View style={styles.fullContainer}>
        <Text style={styles.fullError}>
          {error || "No hay diapositivas disponibles."}
        </Text>
      </View>
    );
  }


  const currentMedia = urls[currentSlide];

  if (!currentMedia) {
    return (
      <View style={styles.fullContainer}>
        <Text style={styles.fullError}>No hay anuncios disponibles.</Text>
      </View>
    );
  }

  if (currentMedia.type === "ProductList") {
    return (
      <View key={`plist-root-${renderKey}`} style={styles.fullContainer}>
        <ProductListSlide
          key={`plist-${renderKey}-${currentSlide}-${cycleKey}`}
          title={currentMedia.title}
          products={[...currentMedia.products]} // 👈 copia forzada
          customization={{ ...currentMedia.customization }} // 👈 copia forzada
          duration={currentMedia.duration}
          onComplete={nextSlide}
          orientation={orientation}
          rotationDirection={rotationDirection}
        />
      </View>
    );
  }






  if (!currentMedia?.url) {
    return (
      <View style={styles.fullContainer}>
        <Text style={styles.fullError}>Archivo no disponible.</Text>
        <Text style={styles.fullText}>Pasando al siguiente...</Text>
      </View>
    );
  }

  const isVideo = currentMedia.url.toLowerCase().includes(".mp4");

  return (
    <View style={styles.fullContainer}>
      <Pressable
        focusable={true}
        onPress={onBack}
        style={{ width: 1, height: 1, opacity: 0 }}
        hasTVPreferredFocus={true}
      />

      {isVideo ? (
        <Video
          ref={videoRef}
          source={{ uri: currentMedia.url }}
          style={StyleSheet.absoluteFill}

          repeat={urls.length === 1}
          onEnd={urls.length > 1 ? nextSlide : undefined}
          onError={(e) => {
            console.error("Error de video:", e);
            nextSlide();
          }}
        />
      ) : (
        <Image
          source={{ uri: currentMedia.url }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          onLoadEnd={() => {
            const duration = (currentMedia.image_seconds || 5) * 1000;
            fallbackTimer.current = setTimeout(() => nextSlide(), duration);
          }}
        />
      )}
    </View>
  );


}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  fullText: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
  },
  fullError: {
    fontSize: 24,
    color: "red",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});
