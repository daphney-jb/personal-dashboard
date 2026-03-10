import WeatherWidget from '../components/widgets/WeatherWidget';
import TodoWidget from '../components/widgets/TodoWidget';
import NewsFeedWidget from '../components/widgets/NewsFeedWidget';
import WhiteboardWidget from '../components/widgets/WhiteboardWidget';

export default function Dashboard() {
  return (
    <div className="widget-grid">
      <WeatherWidget />
      <TodoWidget />
      <NewsFeedWidget />
      <WhiteboardWidget />
    </div>
  );
}
