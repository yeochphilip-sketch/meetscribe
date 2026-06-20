import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  console.log('API called')
  
  try {
    const supabase = await createClient()
    console.log('Supabase client created')
    
    const { data: { user } } = await supabase.auth.getUser()
    console.log('User:', user?.email || 'no user')

    if (!user) {
      console.log('ERROR: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, transcript } = await request.json()
    console.log('Title:', title)
    console.log('Transcript length:', transcript.length)

    if (!title || !transcript) {
      console.log('ERROR: Missing title or transcript')
      return NextResponse.json({ error: 'Title and transcript required' }, { status: 400 })
    }

    console.log('Calling Groq...')
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an expert sales meeting assistant. Analyze the meeting transcript and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "summary": "2-3 sentence summary of the meeting",
  "actionItems": ["Specific action item 1", "Specific action item 2"],
  "followUpEmail": "Professional follow-up email draft"
}`
        },
        {
          role: 'user',
          content: `Meeting Title: ${title}\n\nTranscript:\n${transcript}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    console.log('Parsed result:', JSON.stringify(result, null, 2))

    console.log('Saving to database...')
    const { data: meeting, error: dbError } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title,
        transcript,
        summary: result.summary,
        action_items: result.actionItems || [],
        follow_up_email: result.followUpEmail,
      })
      .select()
      .single()

    if (dbError) {
      console.log('DATABASE ERROR:', dbError)
      return NextResponse.json({ error: 'Failed to save meeting', details: dbError.message }, { status: 500 })
    }

    console.log('Meeting saved:', meeting.id)
    return NextResponse.json({ id: meeting.id })

  } catch (error: any) {
    console.log('CATCH ERROR:', error.message)
    console.log('Stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to process meeting', details: error.message },
      { status: 500 }
    )
  }
}
