import { NextResponse } from 'next/server';
import { getFeaturesConfigAction } from '@/app/(admin)/admin/features/actions';

export async function GET() {
  try {
    const result = await getFeaturesConfigAction();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        config: result.config
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to load features config'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in features config API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
