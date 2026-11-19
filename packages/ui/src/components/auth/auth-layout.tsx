"use client";

import * as React from "react";
import { cn } from "theoui/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Context & Types
 * -----------------------------------------------------------------------------------------------*/

export type RenderLinkProps = React.ComponentProps<"a"> & {
  href: string;
  children?: React.ReactNode;
};

type AuthLayoutContextValue = {
  renderLink?: (props: RenderLinkProps) => React.ReactNode;
};

const AuthLayoutContext = React.createContext<AuthLayoutContextValue>({});

export function useAuthLayout() {
  return React.useContext(AuthLayoutContext);
}

/* -------------------------------------------------------------------------------------------------
 * Brand Logo Icon Default
 * -----------------------------------------------------------------------------------------------*/

export function DefaultBrandLogo({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="auth-layout-brand-logo"
      className={cn(
        "flex size-7 items-center justify-center rounded-lg border bg-muted text-foreground shadow-xs",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M6 4v9a6 6 0 0 0 12 0V4" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Helper: Anchor/Link resolution
 * -----------------------------------------------------------------------------------------------*/

export function AuthLink({
  href,
  className,
  children,
  onClick,
  ...props
}: RenderLinkProps) {
  const { renderLink } = useAuthLayout();
  if (renderLink) {
    return renderLink({ href, className, children, onClick, ...props });
  }
  return (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Compound Components
 * -----------------------------------------------------------------------------------------------*/

export interface AuthLayoutHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function AuthLayoutHeader({
  className,
  children,
  ...props
}: AuthLayoutHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between px-6 py-4 sm:px-8 sm:py-5",
        className,
      )}
      data-slot="auth-layout-header"
      {...props}
    >
      {children}
    </header>
  );
}

export interface AuthLayoutBrandProps extends Omit<
  React.ComponentProps<"a">,
  "href" | "children"
> {
  name?: string;
  logo?: React.ReactNode;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export function AuthLayoutBrand({
  name = "ReUI",
  logo = <DefaultBrandLogo />,
  href = "/",
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: AuthLayoutBrandProps) {
  const accessibleLabel =
    ariaLabel || (typeof name === "string" ? name : undefined);

  if (children) {
    return (
      <AuthLink
        href={href}
        data-slot="auth-layout-brand"
        aria-label={accessibleLabel}
        className={cn(
          "flex items-center gap-2.5 transition-opacity hover:opacity-80",
          className,
        )}
        {...props}
      >
        {children}
      </AuthLink>
    );
  }

  return (
    <AuthLink
      href={href}
      data-slot="auth-layout-brand"
      aria-label={accessibleLabel}
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-80",
        className,
      )}
      {...props}
    >
      {logo}
      {name && (
        <span className="text-base font-semibold tracking-tight text-foreground">
          {name}
        </span>
      )}
    </AuthLink>
  );
}

export interface AuthLayoutActionProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  actionLabel?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function AuthLayoutAction({
  text = "Not on ReUI yet?",
  actionLabel = "Create a workspace",
  href = "/auth/sign-up",
  onClick,
  className,
  children,
  ...props
}: AuthLayoutActionProps) {
  if (children) {
    return (
      <div
        className={cn(
          "flex items-center text-xs text-muted-foreground sm:text-sm",
          className,
        )}
        data-slot="auth-layout-action"
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center text-xs text-muted-foreground sm:text-sm",
        className,
      )}
      data-slot="auth-layout-action"
      {...props}
    >
      {text && <span>{text}</span>}
      {actionLabel && (
        <AuthLink
          href={href}
          onClick={onClick}
          className="ms-1.5 font-medium text-foreground transition-colors hover:underline"
        >
          {actionLabel}
        </AuthLink>
      )}
    </div>
  );
}

export interface AuthLayoutMainProps extends React.HTMLAttributes<HTMLElement> {
  contentClassName?: string;
}

export function AuthLayoutMain({
  className,
  contentClassName,
  children,
  ...props
}: AuthLayoutMainProps) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 py-8",
        className,
      )}
      data-slot="auth-layout-main"
      {...props}
    >
      <div
        className={cn(
          "flex w-full max-w-sm flex-col items-center",
          contentClassName,
        )}
        data-slot="auth-layout-content"
      >
        {children}
      </div>
    </main>
  );
}

export interface AuthLayoutFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function AuthLayoutFooter({
  className,
  children,
  ...props
}: AuthLayoutFooterProps) {
  if (!children) return null;

  return (
    <footer
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 px-4 py-6 sm:py-8",
        className,
      )}
      data-slot="auth-layout-footer"
      {...props}
    >
      {children}
    </footer>
  );
}

export interface AuthLegalNoticeProps extends React.HTMLAttributes<HTMLParagraphElement> {
  appName?: string;
  termsHref?: string;
  privacyHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export function AuthLegalNotice({
  appName = "ReUI",
  termsHref = "/terms",
  privacyHref = "/privacy",
  className,
  children,
  ...props
}: AuthLegalNoticeProps) {
  if (children) {
    return (
      <div
        className={cn(
          "text-center text-xs leading-normal text-muted-foreground",
          className,
        )}
        data-slot="auth-layout-legal-notice"
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }

  return (
    <p
      className={cn(
        "text-center text-xs leading-normal text-muted-foreground",
        className,
      )}
      data-slot="auth-layout-legal-notice"
      {...props}
    >
      By continuing, you agree to {appName}&apos;s{" "}
      <AuthLink
        href={termsHref}
        className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-80"
      >
        Terms of Service
      </AuthLink>{" "}
      and{" "}
      <AuthLink
        href={privacyHref}
        className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-80"
      >
        Privacy Policy
      </AuthLink>
      .
    </p>
  );
}

export const AuthLayoutLegalNotice = AuthLegalNotice;

/* -------------------------------------------------------------------------------------------------
 * AuthHeader: Heading & Description (above the form)
 * -----------------------------------------------------------------------------------------------*/

export interface AuthHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function AuthHeader({
  title,
  description,
  className,
  children,
  ...props
}: AuthHeaderProps) {
  if (children) {
    return (
      <div
        className={cn(
          "mb-6 flex flex-col items-center gap-1.5 text-center",
          className,
        )}
        data-slot="auth-header"
        {...props}
      >
        {children}
      </div>
    );
  }

  if (!title && !description) return null;

  return (
    <div
      className={cn(
        "mb-6 flex flex-col items-center gap-1.5 text-center",
        className,
      )}
      data-slot="auth-header"
      {...props}
    >
      {title &&
        (typeof title === "string" ? (
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        ) : (
          title
        ))}
      {description &&
        (typeof description === "string" ? (
          <p className="max-w-sm text-sm text-balance text-muted-foreground">
            {description}
          </p>
        ) : (
          description
        ))}
    </div>
  );
}

export const AuthLayoutHeading = AuthHeader;

export type AuthFormContainerProps = React.ComponentProps<"div">;

export function AuthFormContainer({
  className,
  ...props
}: AuthFormContainerProps): React.ReactElement {
  return (
    <div
      className={cn("mx-auto w-full max-w-sm px-6", className)}
      data-slot="auth-form-container"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * AuthLayout Root (Supports both Composable Compound & Shorthand Props)
 * -----------------------------------------------------------------------------------------------*/

export type AuthBrandConfig = {
  name?: string;
  logo?: React.ReactNode;
  href?: string;
};

export type AuthHeaderActionConfig = {
  text?: string;
  actionLabel?: string;
  href?: string;
  onClick?: () => void;
};

export interface AuthLayoutProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  mainClassName?: string;
  contentClassName?: string;
  footerClassName?: string;

  /** Title displayed directly above the form */
  title?: React.ReactNode;

  /** Subtitle/description displayed directly above the form */
  description?: React.ReactNode;

  /** Shorthand: brand config */
  brand?: AuthBrandConfig | React.ReactNode;

  /** Shorthand: top right action */
  headerAction?: AuthHeaderActionConfig | React.ReactNode;

  /** Shorthand: legal notice below form */
  legalNotice?: React.ReactNode;

  /** Shorthand: social proof note / footer content */
  footerNote?: React.ReactNode;

  /** Custom Link renderer (e.g. Next.js Link or TanStack Link) */
  renderLink?: (props: RenderLinkProps) => React.ReactNode;
}

export function AuthLayout({
  children,
  className,
  headerClassName,
  mainClassName,
  contentClassName,
  footerClassName,
  title,
  description,
  brand,
  headerAction,
  legalNotice,
  footerNote,
  renderLink,
  ...props
}: AuthLayoutProps) {
  const contextValue = React.useMemo(() => ({ renderLink }), [renderLink]);

  // Check if caller is using shorthand props or pure compound composition
  const isShorthand =
    brand !== undefined ||
    headerAction !== undefined ||
    title !== undefined ||
    description !== undefined ||
    legalNotice !== undefined ||
    footerNote !== undefined;

  return (
    <AuthLayoutContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex min-h-svh w-full flex-col justify-between bg-background text-foreground",
          className,
        )}
        data-slot="auth-layout"
        {...props}
      >
        {isShorthand ? (
          <>
            <AuthLayoutHeader className={headerClassName}>
              {brand === null ? null : React.isValidElement(brand) ? (
                brand
              ) : (
                <AuthLayoutBrand
                  name={(brand as AuthBrandConfig)?.name}
                  logo={(brand as AuthBrandConfig)?.logo}
                  href={(brand as AuthBrandConfig)?.href}
                />
              )}

              {headerAction === null ? null : React.isValidElement(
                  headerAction,
                ) ? (
                headerAction
              ) : (
                <AuthLayoutAction
                  text={(headerAction as AuthHeaderActionConfig)?.text}
                  actionLabel={
                    (headerAction as AuthHeaderActionConfig)?.actionLabel
                  }
                  href={(headerAction as AuthHeaderActionConfig)?.href}
                  onClick={(headerAction as AuthHeaderActionConfig)?.onClick}
                />
              )}
            </AuthLayoutHeader>

            <AuthLayoutMain
              className={mainClassName}
              contentClassName={contentClassName}
            >
              <div className="flex w-full flex-col items-center">
                {(title || description) && (
                  <AuthHeader title={title} description={description} />
                )}
                <div className="flex w-full flex-col items-center gap-6">
                  {children}
                  {legalNotice}
                </div>
              </div>
            </AuthLayoutMain>

            <AuthLayoutFooter className={footerClassName}>
              {footerNote}
            </AuthLayoutFooter>
          </>
        ) : (
          children
        )}
      </div>
    </AuthLayoutContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Attach Sub-Components
 * -----------------------------------------------------------------------------------------------*/

AuthLayout.Header = AuthLayoutHeader;
AuthLayout.Heading = AuthHeader;
AuthLayout.Brand = AuthLayoutBrand;
AuthLayout.Action = AuthLayoutAction;
AuthLayout.Main = AuthLayoutMain;
AuthLayout.Footer = AuthLayoutFooter;
AuthLayout.LegalNotice = AuthLegalNotice;
AuthLayout.Link = AuthLink;
