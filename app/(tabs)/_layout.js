import { View, Text, Image } from 'react-native';
import {Tabs, Redirect} from 'expo-router';
import {icons} from '../../constants';
import React from 'react';

//react funcitonal componement 
const TabIcon = ({icon, color, name, focused}) => {
    return (
        <View className="items-center justify-center gap-2">
            <Image
                source ={icon}
                resizeMode="contain"
                tintColor={color} 
                className="w-6 h-6"
            />
            <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}
            style={{color: color}}
            >
                {name}

            </Text>
        </View>
    )

}
const TabsLayout = () => {
  return (
    <>
        <Tabs
        screenOptions={{
            tabBarShowLabel:false,
            //the color icon that when u stay in the that tab
            tabBarActiveTintColor : '#FFA001',
            tabBarInactiveTintColor : '#CDCDE0', //inactive
            tabBarStyle: {
                backgroundColor: '#161622', //black
                borderTopWidth: 10,
                borderTopColor: '#232553', //purple
                height: 84,
            }
        }}>

        {/* Home section */}
        <Tabs.Screen 
        name="home"
        options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.home}
                    color={color}
                    name="Home"
                    focused={focused}
                />
            )
        }}
        />

        {/* Bookmark section */}
        <Tabs.Screen 
        name="bookmark"
        options={{
            title: 'BookMark',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.bookmark}
                    color={color}
                    name="Bookmark"
                    focused={focused}
                />
            )
        }}
        />

        {/* Create section */}
        <Tabs.Screen 
        name="create"
        options={{
            title: 'Create',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.plus}
                    color={color}
                    name="Create"
                    focused={focused}
                />
            )
        }}
        />

        {/* Bookmark section */}
        <Tabs.Screen 
        name="profile"
        options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.profile}
                    color={color}
                    name="Profile"
                    focused={focused}
                />
            )
        }}
        />

        </Tabs>
    </>
  )
}

export default TabsLayout