import { Icons } from '@/components/icons';
import PrivacyConfirmation from '@/components/modals/PrivacyConfirmation';
import { Switch } from '@/components/ui/switch';
import { PrivacySectionProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import SettingRow from './SettingRow';
import SettingSection from './SettingSection';

const PrivacySection: React.FC<PrivacySectionProps> = ({
  sectionRef,
  user: initialUser,
}) => {
  const [user, setUser] = useState(initialUser);
  const utils = api.useUtils();
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const { mutate: setPrivacy, isLoading: isUpdating } =
    api.user.setPrivacy.useMutation({
      onMutate: async ({ isPrivate }) => {
        await utils.user.getMe.cancel();

        const previousUser = utils.user.getMe.getData();

        const previousLocalUser = user;

        utils.user.getMe.setData(undefined, (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            privacy: isPrivate ? 'PRIVATE' : 'PUBLIC',
          };
        });

        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            privacy: isPrivate ? 'PRIVATE' : 'PUBLIC',
          };
        });

        return { previousUser, previousLocalUser };
      },
      onError: (_, __, context) => {
        utils.user.getMe.setData(undefined, context?.previousUser);
        if (context?.previousLocalUser) {
          setUser(context.previousLocalUser);
        }
        toast.error('Failed to update privacy. Please try again.');
      },
      onSettled: () => {
        utils.user.getMe.invalidate();
        utils.notification.getFollowRequests.invalidate();
        utils.notification.getNotifications.invalidate();
      },
      onSuccess: (data) => {
        setUser((prev) => {
          if (!prev) return prev;
          return { ...prev, privacy: data.privacy };
        });
        toast.success(
          `Your account is now ${
            data.privacy === 'PRIVATE' ? 'private' : 'public'
          }.`
        );
      },
    });

  const handlePrivacyChange = (isPrivate: boolean) => {
    if (user?.privacy === 'PRIVATE' && !isPrivate) {
      setConfirmationModalOpen(true);
    } else {
      setPrivacy({ isPrivate });
    }
  };

  const handleConfirmSwitchToPublic = () => {
    setPrivacy({ isPrivate: false });
    setConfirmationModalOpen(false);
  };

  return (
    <Fragment>
      <SettingSection id='privacy' sectionRef={sectionRef} title='Privacy'>
        <h3 className='text-lg font-medium text-white/90 mx-4 mb-3 antialiased'>
          Discoverability
        </h3>
        <SettingRow
          title='Private account'
          description='With a private account, only users you approve can follow you and watch your videos. Your existing followers won’t be affected.'
          control={
            <Switch
              checked={user?.privacy === 'PRIVATE'}
              onCheckedChange={handlePrivacyChange}
              disabled={isUpdating}
            />
          }
          border
          className='mb-5'
        />
        <h3 className='text-lg font-medium text-white/90 mx-4 my-3 antialiased'>
          Data
        </h3>
        <SettingRow
          title='Download your data'
          description='Get a copy of your Muted data'
          control={
            <Icons.chevronRight style={{ fill: '#fff', fillOpacity: '0.34' }} />
          }
          isButton
        />
      </SettingSection>

      <PrivacyConfirmation
        isOpen={isConfirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleConfirmSwitchToPublic}
      />
    </Fragment>
  );
};

export default PrivacySection;
