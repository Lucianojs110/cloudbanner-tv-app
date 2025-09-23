import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';





import Video from 'react-native-video';

interface Props {
  onSuccess: () => void;
}

const IndexScreen = ({ onSuccess }: Props) => {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [backgroundMedia, setBackgroundMedia] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [cardOpacity] = useState(new Animated.Value(0));
  const [cardTranslateY] = useState(new Animated.Value(20));
  const [businessName, setBusinessName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  const [focusedModalButton, setFocusedModalButton] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  const linkButtonRef = useRef<View>(null);



  const isVideo = backgroundMedia?.toLowerCase().includes('.mp4');

  useEffect(() => {
    verifyDevice();
    animateCard();
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (deviceLinked) {
        onSuccess(); // navega automáticamente si está vinculado
      }
    }, 60000); // 60.000 ms = 60 segundos

    return () => clearTimeout(timer);
  }, [deviceLinked]);


  const animateCard = () => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const verifyDevice = async () => {
    const uuid = await AsyncStorage.getItem('@tv_uuid');

    if (!uuid) {
      // Estado inicial
      await AsyncStorage.removeItem('@tv_uuid');
      setDeviceLinked(false);
      setBusinessName('');
      setDeviceName('');
      setBackgroundMedia(null);
      setErrorMessage('Ingresá el código de vinculación');
      openModal();
      return;
    }

    try {
      const response = await fetch(`https://panel.cloudbanner.io/api/tv/advertisements/${uuid}`);
      if (!response.ok) throw new Error('Respuesta no válida');

      const data = await response.json();
      const ads = data.advertisements || [];

      // Extraer URLs de multimedia
      let urlsFromAds: string[] = [];
      ads.forEach((ad: any) => {
        if (ad.type === 'Multimedia') {
          (ad.data?.media || []).forEach((item: any) => {
            if (item?.data) urlsFromAds.push(item.data);
          });
        } else if (ad.type === 'ProductList') {
          (ad.data?.customization?.media || []).forEach((item: any) => {
            if (item?.original_url) urlsFromAds.push(item.original_url);
          });
        }
      });

      // Chequear si hay productos aunque no tengan media
      const hasProductListContent = ads.some(
        (ad: any) => ad.type === 'ProductList' && (ad.data?.products?.length ?? 0) > 0
      );

      // ❌ Si no hay multimedia ni productos → se invalida el uuid
      if (!urlsFromAds.length && !hasProductListContent) {
        throw new Error('No hay contenido disponible para este dispositivo.');
      }

      // ✅ Si hay algo de contenido
      setDeviceLinked(true);
      setBackgroundMedia(urlsFromAds[0] || null);
      setBusinessName(data.business || '');
      setDeviceName(data.device_name || '');
      setModalVisible(false);
      setErrorMessage('');

    } catch (error: any) {
      console.error('❌ verifyDevice error:', error);

      // 🔥 Estado inicial
      await AsyncStorage.removeItem('@tv_uuid');
      setDeviceLinked(false);
      setBusinessName('');
      setDeviceName('');
      setBackgroundMedia(null);
      setErrorMessage(
        error.message === 'No hay contenido disponible para este dispositivo.'
          ? error.message
          : 'No se pudo conectar con el servidor. Reintentá o volvé a vincular el dispositivo.'
      );
      openModal();
    }
  };





  const handleLinkDevice = async () => {
    if (!code.trim()) return;

    const formData = new FormData();
    formData.append('code', code);

    try {
      const response = await fetch(
        'https://panel.cloudbanner.io/api/tv/link',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();

      if (data.uuid) {
        await AsyncStorage.setItem('@tv_uuid', data.uuid);
        setErrorMessage('');
        verifyDevice();   // El modal se cerrará SOLO si verifyDevice trae contenido
        // NO LLAMES MÁS A closeModal ACÁ
      } else {
        setErrorMessage(data.message || 'Código inválido');
      }
    } catch (error: any) {
      console.error('[ERROR][NETWORK]', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        error,
      });
      setErrorMessage('Error de red: ' + error.message);
    }
  };


  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <LinearGradient
      colors={["#2c5364", "#203a43", "#0f2027"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.card,
          { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
        ]}
      >

        <Image
          source={require('../assets/images/banner.png')}
          style={styles.bannerImage}
        />

        {backgroundMedia &&
          (isVideo ? (
            <Video
              source={{ uri: backgroundMedia }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              shouldPlay
              isLooping
              muted
            />
          ) : (
            <Image
              source={{ uri: backgroundMedia }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              blurRadius={4}
            />
          ))}

        <LinearGradient
          colors={[
            "rgba(13,44,71,0.9)",
            "rgba(13,44,71,0.5)",
            "rgba(13,44,71,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />



        {deviceLinked && businessName !== "" && (
          <Text style={styles.welcomeText}>
            BIENVENIDO, {businessName.toUpperCase()}
          </Text>
        )}

        <View style={styles.content}>
          <View style={styles.leftSide}>
            {deviceLinked ? (
              <>

                <Image
                  source={require('../assets/images/monitor.png')}
                  style={{ width: 80, height: 80, marginBottom: 10 }}
                  resizeMode="contain"
                />
                <Text style={styles.linkedText}>✅ DISPOSITIVO VINCULADO</Text>
                <Text style={styles.deviceName}>{deviceName}</Text>
              </>
            ) : (
              <Text style={styles.linkedText}>❌ DISPOSITIVO NO VINCULADO</Text>
            )}
          </View>
          <View style={styles.buttonsRow}>
            {deviceLinked && (
              <Pressable
                focusable={true}
                hasTVPreferredFocus={true}
                onFocus={() => setFocusedButton("fullscreen")}
                onBlur={() => setFocusedButton(null)}
                onPress={onSuccess}
                style={[
                  styles.fullScreenButton,
                  focusedButton === "fullscreen" &&
                  styles.fullScreenButtonFocused,
                ]}
              >
                <Icon name="expand-outline" size={24} color="#ffffff" />

                <Text style={styles.buttonText}>MOSTRAR PANTALLA COMPLETA</Text>
              </Pressable>
            )}

            <Pressable
              focusable={true}
              hasTVPreferredFocus={!deviceLinked} // si no está vinculado, preferimos el foco acá
              onFocus={() => setFocusedButton("relink")}
              onBlur={() => setFocusedButton(null)}
              onPress={openModal}
              style={[
                styles.relinkButton,
                focusedButton === "relink" && styles.relinkButtonFocused,
              ]}
            >
              <Icon name="sync-outline" size={24} color="#1565C0" />

              <Text style={styles.relinkButtonText}>VINCULAR</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingresa el código</Text>

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                isInputFocused ? styles.inputFocused : null,
              ]}
              onSubmitEditing={handleLinkDevice}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Código"
              autoCapitalize="none"
              autoFocus
              maxLength={6}
              blurOnSubmit={false}
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <View style={styles.modalButtonsRow}>
              <Pressable

                focusable={true}
                hasTVPreferredFocus={true} // arranca enfocado en "VINCULAR"
                onFocus={() => setFocusedModalButton("link")}
                onBlur={() => setFocusedModalButton(null)}
                onPress={handleLinkDevice}
                style={[
                  styles.modalButton,
                  focusedModalButton === "link" && styles.modalButtonFocused,
                ]}
              >
                <Text style={styles.modalButtonText}>VINCULAR</Text>
              </Pressable>

              <Pressable
                focusable={true}
                onFocus={() => setFocusedModalButton("cancel")}
                onBlur={() => {
                  // Devolvé el foco al input
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 200); // leve delay para evitar que se lo saltee
                }}
                onPress={closeModal}
                style={[
                  styles.cancelButton,
                  focusedModalButton === "cancel" && styles.cancelButtonFocused,
                ]}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </Pressable>

            </View>
          </View>
        </Animated.View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inputFocused: {
    borderWidth: 2,
    borderColor: "#1565C0",
  },
  modalButtonFocused: {
    borderWidth: 3,
    borderColor: "#333",
    backgroundColor: "#0D47A1",
  },



  focusedZoom: {
    transform: [{ scale: 1.05 }],
  },
  fullScreenButtonFocused: {
    borderWidth: 3,
    borderColor: "#ffffff",
    borderStyle: "solid",
  },
  relinkButtonFocused: {
    borderWidth: 3,
    borderColor: "#1565C0",
    borderStyle: "solid",
  },
  welcomeText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "300",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1.5,
    marginLeft: 25,
  },
  deviceName: {
    color: "#ccc",
    fontSize: 20,
    marginTop: 4,
    fontWeight: "400",
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1, // 🟢 Que ocupe toda la pantalla
    width: "100%",
    borderRadius: 0, // 🟢 Quitamos borde redondeado para full screen
    overflow: "hidden",
    backgroundColor: "#0d2c47",
  },

  content: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  leftSide: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#102a43",
    minWidth: 200,
    minHeight: 200,
  },
  linkedText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "65%",
  },
  fullScreenButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1565C0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    margin: 6,
    width: "65%",
    maxWidth: 350,
    minWidth: 150,
  },
  relinkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    margin: 6,
    width: "35%",
    maxWidth: 220,
    minWidth: 140,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  relinkButtonText: {
    color: "#1565C0",
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    marginRight: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    padding: 12,
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignSelf: 'center',
  },
  cancelButtonFocused: {
    borderWidth: 3,
    borderColor: "#1565C0",
    backgroundColor: "#eee",
  },
  cancelButtonText: {
    color: "#1565C0",
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    color: "#a30000",
    marginBottom: 10,
    textAlign: "center",
  },
  bannerImage: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 150,
    height: 60,
    resizeMode: 'contain',
    zIndex: 10,
  },

});

export default IndexScreen;
