// app/(tabs)/_layout.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ImageBackground, Text, View } from 'react-native';
import highlight from '../../assets/images/highlightWhite3.png';



const TabIcon =( {focused,icon,title}: any ) => {
    if (focused) {
    return (
      
      <ImageBackground source={highlight} className='flex w-full flex-1 min-w-[100px] min-h-[50px]  justify-center items-center ' >
        <FontAwesome name={icon} size={25}color='#DD3333' />
        <Text className=" mt-1.5 mb-3 text-primary text-sm font-normal text-base ">{title}</Text>
        
      </ImageBackground>
    )
  } else {
    return (
      <View className='size-20 mt-6 justify-center items-center rounded-full overflow-hidden ' >
        <FontAwesome name={icon} size={23}color='#fff' className=' mb-3' />
       
      </View>
    )
  }
  }
  
export default function TabsLayout() {
  return (
    <Tabs
   
      initialRouteName="index"
      screenOptions={{
        tabBarShowLabel:false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        tabBarStyle: { 
            backgroundColor:'#DD3333', 
            borderRadius: 10,
            width: '100%',
            height:'8%',
            position: 'absolute',

           

         

            

        },
        tabBarItemStyle: { 
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            
           
          
        },
      
        
      }}
      
    >
      
      <Tabs.Screen
        name="calendar"
      
        options={{
          title: 'Calendar',
          headerShown:false,
          tabBarIcon: ({focused}) =>   <TabIcon focused={focused}  icon={'calendar'} title ="calendar"/>
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: 'Media',
          headerShown:false,
          tabBarIcon: ({focused}) =>   <TabIcon focused={focused}  icon={'play'} title ="Media"/>
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown:false,
          tabBarIcon: ({focused}) =>   <TabIcon focused={focused}  icon={'home'} title ="home"/>
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: 'Articles',
          headerShown:false,
          tabBarIcon: ({focused}) =>   <TabIcon focused={focused}  icon={'file-text'} title ="Articles"/>
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Donate',
          headerShown:false,
          tabBarIcon: ({focused}) =>   <TabIcon focused={focused}  icon={'heart'} title ="Donate"/>
        }}
      />
     
    
    </Tabs>
  );
}

