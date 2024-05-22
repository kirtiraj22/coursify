"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { Chapter, Course } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { ChaptersList } from "./chapters-list";

interface ChaptersFormProps {
	initialData: Course & { chapters: Chapter[] };
	courseId: string;
}

const formSchema = z.object({
	title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	const toggleCreating = () => {
		setIsCreating((current) => !current);
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
		},
	});

	const router = useRouter();

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.post(`/api/courses/${courseId}/chapters`, values);
			toast.success("Chapter Created Successfully");
			toggleCreating();
			router.refresh();
		} catch (error) {
			console.log("[CHAPTERS FORM]", error);
			toast.error("Something went wrong!");
		}
	};

	const onReorder = async (updateData: {
		id: string;
		position: number
	}[]) => {
		try{
			setIsUpdating(true)

			await axios.put(`/api/courses/${courseId}/chapters/reorder`,{
				list: updateData
			})
			toast.success("Chapters reordered successfully!")
			router.refresh();
		}catch(error){
			console.log("CHAPTER_FORM_REORDER", error)
			toast.error("Something went wrong")
		}finally{
			setIsUpdating(false)
		}
	}

	const onEdit = (id: string) => {
		router.push(`/teacher/courses/${courseId}/chapters/${id}`)
	}

	return (
		<div className="relative mt-6 border bg-slate-100 rounded-md p-4">
			{
				isUpdating && (
					<div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
						<Loader2 className="animate-spin h-6 w-6 text-sky-700"/>
					</div>
				)
			}
			<div className="font-medium flex items-center justify-between">
				Course chapters
				<Button onClick={toggleCreating} variant="ghost">
					{isCreating ? (
						<>Cancel </>
					) : (
						<>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add a chapter
						</>
					)}
				</Button>
			</div>
			{isCreating && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											disabled={isSubmitting}
											placeholder="eg. 'Introduction to the course'"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<Button
							disabled={!isValid || isSubmitting}
							type="submit"
						>
							Create
						</Button>
					</form>
				</Form>
			)}

			{!isCreating && (
				<div
					className={cn(
						"text-sm mt-2",
						!initialData.chapters.length && "text-slate-500 italic"
					)}
				>
					{
						!initialData.chapters.length && "No chapters"
					}
					<ChaptersList 
						onEdit={onEdit}
						onReorder={onReorder}
						items={initialData.chapters || []}
					/>
				</div>
			)}
			{!isCreating && (
				<p className="text-xs text-muted-foreground mt-4">
					Drag and drop to reorder the chapters
				</p>
			)}
		</div>
	);
};
