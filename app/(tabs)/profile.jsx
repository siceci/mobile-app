import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useState, useEffect } from 'react';
import FontSizeContext from '../components/FontSizeContext';
import { logout, getAuthToken } from '../(auth)/auth'; 
import { router } from 'expo-router';
import { images } from '../../constants';
import CustomButton from '../components/CustomButton';


const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch('http://localhost:3000/users/profile', { // 确保这里的URL是正确的
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const jsonResponse = await response.json();
          if (response.ok) {
            setUser(jsonResponse.user);
          } else {
            console.error('Error fetching profile:', jsonResponse.message);
          }
        } else {
          const textResponse = await response.text();
          console.error('Server response is not JSON:', textResponse);
        }
      } catch (error) {
        console.error('Network request error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);


  const handleLogout = async () => {
    await logout();  
    router.push('/sign-in');
  };

  const { fontSize, setFontSize } = useContext(FontSizeContext);



  return (
    <SafeAreaView className="bg-orange-50 h-full">
        <ScrollView>
        <View className="w-full justify-top mt-4 px-6">
     <View className="mb-5">
      <Text className="text-4xl font-bold text-emerald-900">Setting</Text>
      {user ? (
          <>
            <Text className="text-2xl text-orange-400 mt-5 font-semibold">
              Hi! {user.username} 👋
            </Text>
            <Text style={[styles.text, { fontSize }]} 
            className="text-lg font-semibold text-emerald-800 mt-1 mb-10">
              Have you completed your task for today?
            </Text>
          </>
        ) : (
          <Text className="text-2xl text-black mt-5 font-bold">
            User not found
          </Text>
        )}

        <Image 
        source={images.thinking}
        className="w-[400px] h-[250px]"
        resizeMode="contain"
    />

    </View>
    <View className="justify-center items-center gap-1">
    <Text className="text-orange-300 font-bold text-2xl">Set the Font Size for App：</Text>
        
    <TouchableOpacity style={styles.button} onPress={() => setFontSize(16)}>
          <Text className="text-base font-bold text-teal-700">Small</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setFontSize(18)}>
          <Text className="text-lg font-bold text-teal-700">Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setFontSize(20)}>
          <Text className="text-xl font-bold text-teal-700">Large</Text>
        </TouchableOpacity>
        
    </View>
    <View className="mt-3 items-center">
    <Text className="text-center" style={[styles.text, { fontSize }]}>Here is the font size preview for Calendar Task </Text>
        </View>

        </View>

        </ScrollView>
        <View className="ml-5 mr-5">
        <CustomButton
          title="Logout"
          handlePress={handleLogout}
          containerStyles="mt-10 mb-1"
        />
        </View>
    </SafeAreaView>

  )
}
const styles = StyleSheet.create({
  text: {
   
  },
});
export default Profile
