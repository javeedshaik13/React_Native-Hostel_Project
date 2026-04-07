import {View,Text,StyleSheet,Platform,TouchableOpacity,Image, KeyboardAvoidingView} from "react-native";
import { useRouter } from "expo-router";
import { useEffect ,useState,useRef} from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";


const DashboardScreen = () => {
    const router = useRouter();
    const [postImage,setPostImage]=useState(null);
    const [postText,setPostText]=useState("");
    const [postpdf,setPostPdf]=useState(null);
    const [postVideo,setPostVideo]=useState(null);
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex:1}} >  
        <View style={styles.container}>
            <Text>My Dashboard</Text>
            <TouchableOpacity onPress={()=>router.push("/create-post")} style={{marginTop:20}}>
                <Text style={{color:"blue"}}>Post New Image</Text>
            </TouchableOpacity>
                <Image source={postImage} style={styles.postImage}></Image>
                <Text>{postText}</Text>
                <TouchableOpacity onPress={()=>router.push("/create-post")} style={{marginTop:20}}>
                <Text style={{color:"blue"}}>Post New PDF</Text>
            </TouchableOpacity>
                <Text>{postpdf}</Text>      
            
        </View>
        </KeyboardAvoidingView>
    )
}

export default DashboardScreen;

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    },
    input:{
        width:"80%",
        height:40,
        borderWidth :1,
        borderColor:"#ccc",
        borderRadius:5,
        paddingHorizontal:10,
        marginVertical:10,
    },
card:{
    backgroundColor:"#fff",
    borderRadius:10,
    padding:15,
    marginVertical:10,
    shadowColor:"#000",
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.1,
    shadowRadius:5,
    elevation:3,
    width:"90%",
    alignSelf:"center",
},
postImage:{
    width:"100%",
    height:200,
    borderRadius:10,
    marginBottom:10,
}
})