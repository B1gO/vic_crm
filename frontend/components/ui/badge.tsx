import { cn } from "@/lib/utils"
import { LifecycleStage } from "@/lib/api"

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'outline';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                {
                    'default': "bg-primary/10 text-primary",
                    'secondary': "bg-secondary text-secondary-foreground",
                    'outline': "border border-border",
                }[variant],
                className
            )}
        >
            {children}
        </span>
    )
}

const stageStyles: Record<LifecycleStage, string> = {
    RECRUITMENT: "bg-blue-100 text-blue-800",
    TRAINING: "bg-amber-100 text-amber-800",
    MARKET_READY: "bg-emerald-100 text-emerald-800",
    PLACED: "bg-indigo-100 text-indigo-800",
    ELIMINATED: "bg-red-100 text-red-800",
};

const stageLabels: Record<LifecycleStage, string> = {
    RECRUITMENT: "Recruitment",
    TRAINING: "Training",
    MARKET_READY: "Market Ready",
    PLACED: "Placed",
    ELIMINATED: "Eliminated",
};

export function StageBadge({ stage }: { stage: LifecycleStage }) {
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", stageStyles[stage])}>
            {stageLabels[stage]}
        </span>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        ADMIN: "bg-purple-100 text-purple-800",
        RECRUITER: "bg-cyan-100 text-cyan-800",
        TRAINER: "bg-orange-100 text-orange-800",
        MANAGER: "bg-green-100 text-green-800",
    };

    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[role] || "bg-gray-100 text-gray-800")}>
            {role}
        </span>
    );
}
