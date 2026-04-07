import {Text,View,StyleSheet} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserSettings from "../constants/userSettings";
import {SCREEN_WIDTH,SCREEN_HEIGHT} from "../constants/createPostScreen";
import { useNavigation } from "@react-navigation/native";
import { use, useEffect,useState } from "react";


const UserSettings = () => {
    const navigation = useNavigation();
        const [user2FA,setUser2FA] = useState(null);
        const [userBiometric,setUserBiometric] = useState(null);
        const [loading,setLoading] = useState(true);
        const [userActivity,setUserActivity] = useState(null);

        useEffect(()=>{
            const fetchUserSettings = async () => {
                try {   
                    const response = await fetch("https://api.digilocker.com/user/settings",{
                        method:"GET",
                        headers:{
                            "Content-Type":"application/json",
                            "Authorization":"Bearer YOUR_AUTH_TOKEN"
    return (
        <View style={styles.container}>
            <Text>User Settings Screen</Text>
        </View>
    );
};

export default UserSettings;    