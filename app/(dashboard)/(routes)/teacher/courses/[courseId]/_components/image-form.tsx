"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

interface ImageFormProps {
	initialData: {
		description: string;
	};
	courseId: string;
}

const formSchema = z.object({
	imageUrl: z.string().min(1, {
		message: "Image is required",
	}),
});

export const ImageForm = ({
	initialData,
	courseId,
}: ImageFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			imageUrl: initialData?.imageUrl || "" 
		},
	});

    const router = useRouter();

	const { isSubmitting, isValid } = form.formState;
    
	const toggleEdit = () => setIsEditing((current) => !current);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try{
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success("Description updated Successfully")
            toggleEdit();
            router.refresh();
        }catch(error){
            console.log("[DESCRIPTION FORM]", error);
            toast.error("Something went wrong!")
        }
	};

	return (
		<div className="mt-6 border bg-slate-100 rounded-md p-4">
			<div className="font-medium flex items-center justify-between">
				Course image
				<Button onClick={toggleEdit} variant="ghost">
					{isEditing && (
						<>Cancel </>
					)}

					{
						!isEditing && !initialData.imageUrl && (
							<>
								<PlusCircle className="h-4 w-4 mr-2"/>
								Add an image
							</>
						)
					}

					{!isEditing && initialData.imageUrl && (
						<>
							<Pencil className="h-4 w-4 mr-2" />
							Edit Image
						</>
					)}
				</Button>
			</div>  
			{!isEditing && (
				!initialData.imageUrl ? (
					<div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
						<ImageIcon className="h-10 w-10 text-slate-500"/>
					</div>
				) : (
					<div className="relative aspect-video mt-2">
						<Image />
					</div>
				)
			)}
			{isEditing && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-4"
					>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
                                            disabled={isSubmitting}
                                            placeholder="This course is about..."
                                            {...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="flex items-center gap-x-2">
							<Button
								disabled={!isValid || isSubmitting}
								type="submit"
							>
								Save
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
};
