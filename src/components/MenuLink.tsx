import { NavLink } from 'react-router-dom';

interface Props {
    name: string;
    icon: string;
    to: string;
    className: string;
    activeClassName?: string;
    onClick?: () => void
}

export const MenuLink = ({ name, icon, to, className, activeClassName, onClick }: Props) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }: { isActive: boolean }) =>
                `${className} ${isActive ? activeClassName : ''}`
            }>
            <i className={icon}></i>
            <span>{name}</span>
        </NavLink>
    )
}