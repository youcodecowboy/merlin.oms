import { supabase } from '@/lib/supabase'

const stages = ['CUTTING', 'SEWING', 'WASHING', 'FINISHING', 'QC', 'READY']

export async function moveToNextStage(id: string): Promise<string> {
  const { data: current, error: fetchError } = await supabase
    .from('production')
    .select('current_stage')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const currentIndex = stages.indexOf(current.current_stage)
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    throw new Error('Cannot move to next stage')
  }

  const nextStage = stages[currentIndex + 1]

  const { error: updateError } = await supabase
    .from('production')
    .update({ current_stage: nextStage })
    .eq('id', id)

  if (updateError) throw updateError
  return nextStage
}