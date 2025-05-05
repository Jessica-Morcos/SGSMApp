import { Image, ScrollView, Text, View } from "react-native";
import headerIMG from "../../assets/images/HomeHeader.png";
import { useEvents } from '../hooks/useEvents';




export default function Index() {
  const { events, loading } = useEvents();
  const todayKey = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(e =>
    e.start.toISOString().startsWith(todayKey)
  );
  const fmt = (date: Date) =>
    date.toLocaleTimeString([], {
      hour:   'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
  return (
    
 <ScrollView className='bg-white flex-1 '>
  <View className=" bg-primary flex-0 w-full absolute h-[50%] "></View>
  <Image
        source={headerIMG}
        className="w-full h-[17rem] mt-16 "
        resizeMode="stretch"
      />
   <View className="px-4 mt-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-semibold">Today</Text>
          <Text className="text-red-600 font-medium">
            {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
          </Text>
        </View>

        {todaysEvents.length === 0 ? (
          <Text className="text-gray-700">No services today</Text>
        ) : (
          todaysEvents.map(evt => (
            <View
              key={evt.id}
              className="flex-row justify-between items-center py-2 border-b border-gray-200"
            >
              <Text className="font-medium text-gray-900">{evt.title}</Text>
              <Text className="text-gray-500">{fmt(evt.start)}–{fmt(evt.end)}</Text>
            </View>
          ))
        )}
      </View>
   
</ScrollView>

  );
}
