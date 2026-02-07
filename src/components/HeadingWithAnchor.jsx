import { CopyLinkButton } from './CopyLinkButton';

export function HeadingWithAnchor({ as: Component = 'h1', id, children, className }) {
    return (
        <Component id={id} className={`group relative ${className}`}>
            <span className="inline-block">{children}</span>
            <CopyLinkButton id={id} />
        </Component>
    );
}
