import React from 'react'
import { CallComp } from '../components'
import { useSelector } from 'react-redux'

const Call = () => {
  const callList = useSelector(state => state.global.callLogs)

  // const callList = [
  //   {
  //     id: 1,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'missedCall',
  //     duration: "120"
  //   },
  //   {
  //     id: 2,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'incommingCall',
  //     duration: "120"
  //   },
  //   {
  //     id: 3,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'missedCall',
  //     duration: "120"
  //   },
  //   {
  //     id: 4,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'incommingCall',
  //     duration: "120"
  //   },
  //   {
  //     id: 3,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'outgoingCall',
  //     duration: "120"
  //   },
  //   {
  //     id: 1,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'missedCall',
  //     duration: "120"
  //   },
  //   {
  //     id: 2,
  //     from: 'John Doe',
  //     to: 'mark nelson',
  //     startCall: '12:00 PM',
  //     endCall: '01:00 PM',
  //     status: 'incommingCall',
  //     duration: "120"
  //   },
  // ]

  return (
    <div className="w-full h-[90vh] p-4 overflow-auto">
      <div className=" w-full flex flex-col gap-1">
        {callList?.map((call, index) => (
          <CallComp key={index} call={call} />
        ))}
      </div>
    </div>
  )
}

export default Call