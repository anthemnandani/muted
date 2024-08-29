import { LucideIcon } from 'lucide-react';

export type IconProps =
  | React.HTMLAttributes<SVGElement>
  | React.SVGProps<SVGSVGElement>;

export interface AppearanceMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export interface MenuLinkProps {
  route: string;
  isActive: boolean;
  addFill?: boolean;
  icon: (props: IconProps) => JSX.Element;
}

export interface MenuItemProps {
  icon: LucideIcon | ((props: IconProps) => JSX.Element);
  label: string;
  onClick?: () => void;
  className?: string;
  isActionMenuItem?: boolean;
}

export interface ThreadCardProps {
  id: string;
  content: string;
  author: {
    id: string;
    image: string;
    name: string;
  };
  community: { id: string; name: string; image: string } | null;
  comments: any[];
  parentId: string;
  createdAt: Date;
  currentUserId: string;
  isComment?: boolean;
  isLastThread?: boolean;
}
