import {StyleSheet} from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import AboutScreen from "../screens/AboutScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {registerRootComponent} from "expo";


const Drawer=createDrawerNavigator();
const Tab=createBottomTabNavigator();

const TabNavigator=()=>{
    return(
        <Tab.Navigator>
            <Tab.Screen name="Home" component={DashboardScreen} options={{
                tabBarIcon:({color,size})=>(
                    <Ionicons name="home" size={size} color={color} />
                )
            }}/>
            <Tab.Screen name="About" component={AboutScreen} options={{
                tabBarIcon:({color,size})=>(
                    <Ionicons name="information-circle" size={size} color={color} />
                )
            }}/>
            <Tab.Screen name="Profile" component={ProfileScreen} options={{
                tabBarIcon:({color,size})=>(
                    <Ionicons name="person" size={size} color={color} />
                )
            }}/>
            <Tab.Screen name="Settings" component={SettingsScreen} options={{
                tabBarIcon:({color,size})=>(
                    <Ionicons name="settings" size={size} color={color} />
                )
            }}/>
        </Tab.Navigator>
    );
};

const App=()=>{
    return(
        <NavigationContainer>
            <Drawer.Navigator>
                <Drawer.Screen name="Home" component={TabNavigator}/>
                <Drawer.Screen name="About" component={AboutScreen}/>
                <Drawer.Screen name="Profile" component={ProfileScreen}/>
                <Drawer.Screen name="Settings" component={SettingsScreen}/>
                <Drawer.Screen name="Login" component={LoginScreen}/>
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    }
})

registerRootComponent(App);
