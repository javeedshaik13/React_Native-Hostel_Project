import {View,Text,StyleSheet,TextInput,KeyboardAvoidingView,TouchableOpacity,ScrollView,Platform} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useState,useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const SignUpScreen = ({email: initialEmail, password: initialPassword}) => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(()=>{
        setEmail(initialEmail||"");
        setPassword(initialPassword||"");
    },[initialEmail, initialPassword])
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex:1}} >
            <ScrollView contentContainerStyle={{flexGrow:1}} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <Text> Sign Up Screen</Text>
                    <TextInput placeholder="Enter Email" style={styles.input} value={email} onChangeText={setEmail}/>
                    <TextInput placeholder="Enter Password" style={styles.input} value={password} onChangeText={setPassword}/>
                    <Button title="Sign Up" onPress={()=>navigation.navigate("DashboardScreen",{email,password})}/>
                    <Link onPress={()=>navigation.navigate("LoginScreen")} style={{marginTop:20}}>
                        Already have an account? Login
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SignUpScreen;

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    }   ,
    input:{
        width:"80%",
        height:40,
        borderWidth :1,
        borderColor:"#ccc",
        borderRadius:5,
        paddingHorizontal:10,
        marginVertical:10,
    }
})
