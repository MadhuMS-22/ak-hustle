import React from 'react'
import classNames from 'classnames';
import { useState } from 'react';
const patran = () => {

    const [selected, setSelected] = useState(null);
    console.log(selected);

    const options = [
        { id: 'A', text: '40 km/h' },
        { id: 'B', text: '50 km/h' },
        { id: 'C', text: '60 km/h' },
        { id: 'D', text: '70 km/h' },
    ];

    return (
        <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans antialiased w-screen min-h-screen flex flex-col items-center justify-center text-white'>
            <div className="w-[50vw] h-[55vh] bg-slate-800 p-4 rounded-2xl text-white relative">
                <p className="text-3xl font-bold">
                    A train travels 240 km at a uniform speed. If the speed had been 10 km/h more, it would have taken 2 hours less for the journey. What is the original speed of the train?
                </p>

                <div className="grid grid-cols-2 gap-4 mt-10 text-white">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className={classNames(
                                "font-bold text-2xl rounded-md py-2 m-2 cursor-pointer text-center",
                                {
                                    "bg-green-500": selected === option.id,
                                    "bg-slate-900": selected !== option.id
                                }
                            )}
                            onClick={() => setSelected(option.id)}
                        >
                            {option.id}) {option.text}
                        </div>
                    ))}
                </div>
            </div>
                <button className='w-1/4 bg-[rgb(55,83,187)] p-4 mt-10 bottom-5 left-[33%] rounded-full hover:bg-[rgb(55,92,229)] font-bold text-2xl'>Submit</button>
        </div>
    )
}

export default patran
