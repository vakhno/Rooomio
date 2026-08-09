import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "./command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "./popover";
import { cn } from "../../lib/cn";

const DEFAULT_CLASSNAME: string = "" as const;
const DEFAULT_VALUES: ComboboxValueType[] = [] as const;
const DEFAULT_VALUE: string = "" as const;
const DEFAULT_LABEL: string = "" as const;
const DEFAULT_PLACEHOLDER: string = "" as const;
const DEFAULT_EMPTY_TEXT: string = "" as const;
const DEFAULT_DISABLED: boolean = false as const;

export type ComboboxValueType = { value: string; label: string };

interface ComboboxTypes {
	className?: string;
	values?: ComboboxValueType[];
	value?: string;
	placeholder?: string;
	label?: string;
	emptyText?: string;
	disabled?: boolean;
	onChange?: (value: string) => void;
}

export function Combobox({
	className = DEFAULT_CLASSNAME,
	values = DEFAULT_VALUES,
	value = DEFAULT_VALUE,
	placeholder = DEFAULT_PLACEHOLDER,
	label = DEFAULT_LABEL,
	emptyText = DEFAULT_EMPTY_TEXT,
	disabled = DEFAULT_DISABLED,
	onChange
}: ComboboxTypes) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState(value);

	useEffect(() => {
		setSelected(value);
	}, [value]);

	const handleSelect = (currentValue: string) => {
		const newValue = currentValue === selected ? "" : currentValue;
		setSelected(newValue);
		onChange?.(newValue);
		setOpen(false);
	};

	return (
		<Popover modal={true} open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					disabled={disabled}
					role="combobox"
					aria-expanded={open}
					className={cn("justify-between", className)}
				>
					{selected
						? values.find(item => item.value === selected)?.label
						: label }
					<ChevronsUpDown />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
				<Command
					className="**:data-[slot=command-input-wrapper]:h-11"
					shouldFilter={true}
					filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}
				>
					<CommandInput placeholder={placeholder || "Search..."} />
					<CommandList>
						<CommandEmpty>{emptyText || "No results found."}</CommandEmpty>
						<CommandGroup>
							{values.map(item => (
								<CommandItem
									key={item.value}
									value={item.label}
									onSelect={() => handleSelect(item.value)}
								>
									<Check
										className={cn(
											selected === item.value ? "opacity-100" : "opacity-0"
										)}
									/>
									{item.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

// "use client";

// import { Check, ChevronsUpDown } from "lucide-react";
// import { useEffect, useState } from "react";

// import { Button } from "./button";
// import {
// 	Command,
// 	CommandEmpty,
// 	CommandGroup,
// 	CommandInput,
// 	CommandItem,
// 	CommandList
// } from "./command";
// import {
// 	Popover,
// 	PopoverContent,
// 	PopoverTrigger
// } from "./popover";
// import { cn } from "../../lib/cn";

// const DEFAULT_CLASSNAME: string = "" as const;
// const DEFAULT_VALUES: ComboboxValueType[] = [] as const;
// const DEFAULT_VALUE: string = "" as const;
// const DEFAULT_LABEL: string = "" as const;
// const DEFAULT_PLACEHOLDER: string = "" as const;
// const DEFAULT_EMPTY_TEXT: string = "" as const;
// const DEFAULT_DISABLED: boolean = false as const;

// export type ComboboxValueType = { value: string; label: string };

// interface ComboboxTypes {
// 	className?: string;
// 	values?: ComboboxValueType[];
// 	value?: string;
// 	placeholder?: string;
// 	label?: string;
// 	emptyText?: string;
// 	disabled?: boolean;
// 	onChange?: (value: string) => void;
// }

// export function Combobox({
// 	className = DEFAULT_CLASSNAME,
// 	values = DEFAULT_VALUES,
// 	value = DEFAULT_VALUE,
// 	placeholder = DEFAULT_PLACEHOLDER,
// 	label = DEFAULT_LABEL,
// 	emptyText = DEFAULT_EMPTY_TEXT,
// 	disabled = DEFAULT_DISABLED,
// 	onChange
// }: ComboboxTypes) {
// 	const [open, setOpen] = useState(false);
// 	const [selected, setSelected] = useState(value);

// 	// Sync internal state with prop changes
// 	useEffect(() => {
// 		setSelected(value);
// 	}, [value]);

// 	const handleSelect = (currentValue: string) => {
// 		const newValue = currentValue === selected ? "" : currentValue;
// 		setSelected(newValue);
// 		onChange?.(newValue);
// 		setOpen(false);
// 	};

// 	return (
// 		<Popover open={open} onOpenChange={setOpen}>
// 			<PopoverTrigger asChild>
// 				<Button
// 					disabled={disabled}
// 					role="combobox"
// 					aria-expanded={open}
// 					className={cn("justify-between", className)}
// 				>
// 					{selected
// 						? values.find(item => item.value === selected)?.label
// 						: label }
// 					<ChevronsUpDown />
// 				</Button>
// 			</PopoverTrigger>
// 			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
// 				<Command className="**:data-[slot=command-input-wrapper]:h-11">
// 					<CommandInput placeholder={placeholder} />
// 					<CommandList>
// 						<CommandEmpty>{emptyText}</CommandEmpty>
// 						<CommandGroup>
// 							{values.map(item => (
// 								<CommandItem
// 									key={item.value}
// 									value={item.value}
// 									onSelect={handleSelect}
// 								>
// 									<Check
// 										className={cn(
// 											selected === item.value ? "opacity-100" : "opacity-0"
// 										)}
// 									/>
// 									{item.label}
// 								</CommandItem>
// 							))}
// 						</CommandGroup>
// 					</CommandList>
// 				</Command>
// 			</PopoverContent>
// 		</Popover>
// 	);
// }
