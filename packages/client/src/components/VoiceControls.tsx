interface VoiceControlsProps {
    isRecording: boolean
    onStartRecord: () => void
    onStopRecord: () => void
    onClear: () => void
  }
  
  export function VoiceControls({ isRecording, onStartRecord, onStopRecord, onClear }: VoiceControlsProps) {
    return (
      <div className="voice-controls">
        <button className="voice-action-button" onClick={onClear}>
          {/* 清除图标 */}
        </button>
        
        <button 
          className={`voice-record-button ${isRecording ? 'recording' : ''}`}
          onMouseDown={onStartRecord}
          onMouseUp={onStopRecord}
        >
          {/* 麦克风图标 */}
        </button>
        
        <button className="voice-action-button">
          {/* 设置图标 */}
        </button>
      </div>
    )
  }