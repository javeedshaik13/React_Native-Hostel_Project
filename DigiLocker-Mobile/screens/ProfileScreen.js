import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Image, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = ({ firstName, lastName, email, phone, address }) => {
    const [firstNameState, setFirstNameState] = useState(firstName || "");
    const [lastNameState, setLastNameState] = useState(lastName || "");
    const [emailState, setEmailState] = useState(email || "");
    const [phoneState, setPhoneState] = useState(phone || "");
    const [addressState, setAddressState] = useState(address || "");
    const [image, setImage] = useState(null);

    useEffect(() => {
        setFirstNameState(firstName || "");
        setLastNameState(lastName || "");
        setEmailState(email || "");
        setPhoneState(phone || "");
        setAddressState(address || "");
    }, [firstName, lastName, email, phone, address]);

    const handleUpdateProfile = () => {
        console.log("Profile updated");
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const initials = `${firstNameState?.[0] || ""}${lastNameState?.[0] || ""}`.toUpperCase() || "?";
    const fullName = [firstNameState, lastNameState].filter(Boolean).join(" ") || "Your Name";

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Banner */}
                <View style={styles.banner}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.85}>
                        {image
                            ? <Image source={{ uri: image }} style={styles.avatar} />
                            : <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                              </View>
                        }
                        <View style={styles.cameraIcon}>
                            <Text style={styles.cameraIconText}>✎</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.nameText}>{fullName}</Text>
                    <Text style={styles.emailBadge}>{emailState || "No email set"}</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter first name"
                        placeholderTextColor="#aaa"
                        value={firstNameState}
                        onChangeText={setFirstNameState}
                    />

                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter last name"
                        placeholderTextColor="#aaa"
                        value={lastNameState}
                        onChangeText={setLastNameState}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email"
                        placeholderTextColor="#aaa"
                        value={emailState}
                        onChangeText={setEmailState}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter phone number"
                        placeholderTextColor="#aaa"
                        value={phoneState}
                        onChangeText={setPhoneState}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        placeholder="Enter address"
                        placeholderTextColor="#aaa"
                        value={addressState}
                        onChangeText={setAddressState}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ProfileScreen;

const ACCENT = "#4A90E2";
const BANNER_BG = "#4A90E2";

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#F2F4F8",
    },
    scrollContent: {
        alignItems: "center",
        paddingBottom: 24,
    },

    /* ── Banner ── */
    banner: {
        width: "100%",
        backgroundColor: BANNER_BG,
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 32,
        marginBottom: 0,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: 12,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: "#fff",
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#7ab3e8",
        borderWidth: 3,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        color: "#fff",
        fontSize: 38,
        fontWeight: "700",
        letterSpacing: 2,
    },
    cameraIcon: {
        position: "absolute",
        bottom: 2,
        right: 2,
        backgroundColor: "#fff",
        borderRadius: 14,
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    cameraIconText: {
        fontSize: 14,
        color: ACCENT,
    },
    nameText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 4,
    },
    emailBadge: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
    },

    /* ── Card ── */
    card: {
        width: "92%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginTop: -20,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        fontStyle: "bold",
        color: "#333",
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    label: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 4,
        marginTop: 10,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: "#F8F9FB",
        borderWidth: 1,
        borderColor: "#E8EAF0",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 15,
        color: "#222",
    },
    inputMultiline: {
        height: 80,
        textAlignVertical: "top",
    },

    /* ── Button ── */
    button: {
        width: "92%",
        backgroundColor: ACCENT,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: ACCENT,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});