import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }
  
  try {
    // 获取文件
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }
    
    // 获取文件内容
    const buffer = await response.arrayBuffer()
    
    // 从URL中提取文件名
    const urlPath = new URL(url).pathname
    const filename = urlPath.split('/').pop() || 'compressed_image'
    
    // 设置响应头强制下载
    const headers = new Headers()
    headers.set('Content-Type', 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Cache-Control', 'no-cache')
    
    return new NextResponse(buffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' }, 
      { status: 500 }
    )
  }
}