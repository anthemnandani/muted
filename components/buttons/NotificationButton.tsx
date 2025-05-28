import { type NotificationTab } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/store/notificationStore';

const NotificationButton = ({
  btnTitle,
  id,
}: {
  btnTitle: string;
  id: NotificationTab;
}) => {
  const { activeTab, setActiveTab } = useNotificationStore();
  return (
    <button
      className={cn(
        'text-center rounded-xl px-2 py-0.5 text-sm font-semibold',
        activeTab === id
          ? 'bg-white/90 text-[#121212]'
          : 'text-white/90 bg-white-8 hover:bg-white/10 transition-colors duration-150 ease-in'
      )}
      onClick={() => setActiveTab(id)}
    >
      {btnTitle}
    </button>
  );
};

export default NotificationButton;
